import { Router, Request, Response } from 'express';
import { google } from 'googleapis';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { User } from '../models/mongo/User';
import { Application } from '../models/mongo/Application';
import { Notification } from '../models/mongo/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();

const getOAuthClient = () => {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
};

// GET /api/gmail/auth-url — get Gmail OAuth URL
router.get('/auth-url', authenticate, (req: AuthRequest, res: Response): void => {
  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
    state: req.userId, // pass userId so callback knows who to update
  });
  res.json({ url });
});

// GET /api/gmail/callback — handle OAuth callback
router.get('/callback', async (req: Request, res: Response): Promise<void> => {
  const { code, state } = req.query;
  if (!code) {
    res.status(400).json({ message: 'No authorization code provided' });
    return;
  }

  try {
    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens.refresh_token) {
      res.redirect(`${process.env.FRONTEND_URL}/settings?gmail=error&reason=no_refresh_token`);
      return;
    }

    // state contains userId
    const userId = state as string;
    await User.findByIdAndUpdate(userId, { googleRefreshToken: tokens.refresh_token, gmailConnected: true });

    res.redirect(`${process.env.FRONTEND_URL}/settings?gmail=connected`);
  } catch (error) {
    console.error('Gmail OAuth error:', error);
    res.redirect(`${process.env.FRONTEND_URL}/settings?gmail=error`);
  }
});

// POST /api/gmail/sync — manually trigger email sync
router.post('/sync', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user || !user.googleRefreshToken) {
      res.status(400).json({ message: 'Gmail not connected. Please connect your Gmail first.' });
      return;
    }

    const oauth2Client = getOAuthClient();
    oauth2Client.setCredentials({ refresh_token: user.googleRefreshToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Search for job-related emails from the past 30 days
    const thirtyDaysAgo = Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000);
    const query = `after:${thirtyDaysAgo} (subject:"application received" OR subject:"interview" OR subject:"offer letter" OR subject:"we regret" OR subject:"thank you for applying" OR subject:"next steps" OR subject:"assessment" OR subject:"hiring") -from:me`;

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: query,
      maxResults: 20,
    });

    const messages = listResponse.data.messages || [];
    const processedCount = { new: 0, updated: 0 };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    for (const msg of messages) {
      if (!msg.id) continue;

      const fullMsg = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id,
        format: 'full',
      });

      const headers = fullMsg.data.payload?.headers || [];
      const subject = headers.find(h => h.name === 'Subject')?.value || '';
      const from = headers.find(h => h.name === 'From')?.value || '';
      const date = headers.find(h => h.name === 'Date')?.value || '';

      // Get email body
      let body = '';
      const parts = fullMsg.data.payload?.parts || [];
      for (const part of parts) {
        if (part.mimeType === 'text/plain' && part.body?.data) {
          body = Buffer.from(part.body.data, 'base64').toString('utf8');
          break;
        }
      }
      if (!body && fullMsg.data.payload?.body?.data) {
        body = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf8');
      }

      // Use Gemini to parse the email
      const parsePrompt = `Analyze this job-related email and extract structured information.

Subject: ${subject}
From: ${from}
Date: ${date}
Body: ${body.slice(0, 2000)}

Extract and return JSON with exactly these keys:
- company: string (company name, or null if unclear)
- role: string (job title/role, or null if unclear)
- stage: string (one of: "applied", "screening", "interview", "offer", "rejected", or null)
- isJobRelated: boolean (true if this is genuinely about a job application)
- summary: string (one sentence summary of the email)

Return only valid JSON, no other text.`;

      try {
        const parseResult = await model.generateContent(parsePrompt);
        const parseText = parseResult.response.text().replace(/```json\n?|\n?```/g, '').trim();
        const parsed = JSON.parse(parseText);

        if (!parsed.isJobRelated || !parsed.company) continue;

        // Check if application already exists (by gmail thread)
        const threadId = fullMsg.data.threadId;
        const existingApp = await Application.findOne({
          userId: req.userId,
          $or: [
            { gmailThreadId: threadId },
            { company: { $regex: new RegExp(parsed.company, 'i') } },
          ],
        });

        if (existingApp) {
          // Update stage if changed
          if (parsed.stage && parsed.stage !== existingApp.stage) {
            await Application.findByIdAndUpdate(existingApp._id, {
              stage: parsed.stage,
              gmailThreadId: threadId,
              $push: {
                timeline: {
                  event: parsed.summary,
                  date: new Date(date),
                  source: 'gmail',
                },
              },
            });
            await Notification.create({
              userId: req.userId,
              type: 'gmail_sync',
              title: `${parsed.company} — Email Detected`,
              message: parsed.summary,
              applicationId: existingApp._id.toString(),
            });
            processedCount.updated++;
          }
        } else if (parsed.stage) {
          // Create new application from email
          const newApp = await Application.create({
            userId: req.userId,
            company: parsed.company,
            role: parsed.role || 'Unknown Role',
            stage: parsed.stage,
            gmailThreadId: threadId,
            timeline: [{ event: parsed.summary, date: new Date(date), source: 'gmail' }],
          });
          await Notification.create({
            userId: req.userId,
            type: 'gmail_sync',
            title: `New application detected — ${parsed.company}`,
            message: `${parsed.role} at ${parsed.company} added from your Gmail`,
            applicationId: newApp._id.toString(),
          });
          processedCount.new++;
        }
      } catch (parseError) {
        console.error('Error parsing email with AI:', parseError);
      }
    }

    res.json({
      message: 'Gmail sync completed',
      processed: messages.length,
      new: processedCount.new,
      updated: processedCount.updated,
    });
  } catch (error) {
    console.error('Gmail sync error:', error);
    res.status(500).json({ message: 'Gmail sync failed', error: String(error) });
  }
});

// DELETE /api/gmail/disconnect
router.delete('/disconnect', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await User.findByIdAndUpdate(req.userId, { googleRefreshToken: undefined, gmailConnected: false });
    res.json({ message: 'Gmail disconnected successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
