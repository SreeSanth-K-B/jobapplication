import { Router, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AISession } from '../models/mongo/AISession';
import { Application } from '../models/mongo/Application';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

const getGemini = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured');
  const genAI = new GoogleGenerativeAI(apiKey);
  return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// POST /api/ai/resume-analyze
router.post('/resume-analyze', async (req: AuthRequest, res: Response): Promise<void> => {
  const { resumeText, jobDescription, company, role } = req.body;
  try {
    const model = getGemini();
    const prompt = `You are an expert resume coach. Analyze this resume against the job description.
    
Company: ${company}
Role: ${role}

Job Description:
${jobDescription}

Resume:
${resumeText}

Provide:
1. Overall fit score (0-100)
2. Top 3 strengths that match the JD
3. Top 3 gaps or missing skills
4. 3 specific improvements to make the resume stronger for this role
5. Keywords to add

Format your response as JSON with keys: score, strengths, gaps, improvements, keywords`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    await AISession.create({
      userId: req.userId,
      type: 'resume_analyze',
      input: { resumeText: resumeText.slice(0, 500), jobDescription: jobDescription.slice(0, 500), company, role },
      output,
    });

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: String(error) });
  }
});

// POST /api/ai/cover-letter
router.post('/cover-letter', async (req: AuthRequest, res: Response): Promise<void> => {
  const { company, role, jobDescription, resumeText, tone } = req.body;
  try {
    const model = getGemini();
    const prompt = `Write a professional cover letter for this job application.

Company: ${company}
Role: ${role}
Tone: ${tone || 'professional and enthusiastic'}

Job Description:
${jobDescription}

Candidate's Background (from resume):
${resumeText}

Write a compelling, personalized cover letter that:
- Opens with a strong hook (not "I am applying for...")
- Highlights 2-3 specific skills that match the JD
- Shows genuine interest in the company
- Is concise (under 350 words)
- Ends with a clear call to action`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    await AISession.create({
      userId: req.userId,
      type: 'cover_letter',
      input: { company, role, tone },
      output,
    });

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: String(error) });
  }
});

// POST /api/ai/interview-prep
router.post('/interview-prep', async (req: AuthRequest, res: Response): Promise<void> => {
  const { company, role, jobDescription, applicationId } = req.body;
  try {
    const model = getGemini();
    const prompt = `You are an expert interview coach. Generate interview preparation for this role.

Company: ${company}
Role: ${role}
Job Description:
${jobDescription}

Provide:
1. 5 most likely technical/role-specific questions with ideal answer frameworks
2. 3 behavioral questions (STAR method) relevant to this role
3. 2 questions to ask the interviewer
4. Key things to research about ${company}
5. One red flag to avoid

Format as structured JSON with keys: technicalQuestions, behavioralQuestions, questionsToAsk, companyResearch, redFlag`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    await AISession.create({
      userId: req.userId,
      type: 'interview_prep',
      input: { company, role },
      output,
      applicationId,
    });

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: String(error) });
  }
});

// POST /api/ai/email-draft
router.post('/email-draft', async (req: AuthRequest, res: Response): Promise<void> => {
  const { company, role, stage, recruiterName, context, emailType } = req.body;
  try {
    const model = getGemini();
    const prompt = `Write a professional ${emailType || 'follow-up'} email.

Company: ${company}
Role: ${role}
Current Stage: ${stage}
Recruiter Name: ${recruiterName || 'Hiring Manager'}
Context: ${context || 'Following up on application'}

Write a concise, professional email that:
- Has a clear subject line
- Is friendly but professional
- Gets straight to the point
- Is under 150 words
- Includes a call to action

Return JSON with keys: subject, body`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    await AISession.create({
      userId: req.userId,
      type: 'email_draft',
      input: { company, role, stage, emailType },
      output,
    });

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: String(error) });
  }
});

// GET /api/ai/weekly-debrief
router.get('/weekly-debrief', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const applications = await Application.find({
      userId: req.userId,
      updatedAt: { $gte: oneWeekAgo },
    });

    const model = getGemini();
    const appSummary = applications.map(a => ({
      company: a.company,
      role: a.role,
      stage: a.stage,
    }));

    const prompt = `You are a career coach giving a weekly job search debrief.

Applications this week:
${JSON.stringify(appSummary, null, 2)}

Total applications: ${applications.length}
Stages: ${[...new Set(applications.map(a => a.stage))].join(', ')}

Provide a motivating, actionable weekly debrief with:
1. A brief summary of the week's activity
2. What's going well
3. One area to improve
4. Top 3 action items for next week
5. A motivational closing message

Keep it concise, warm, and actionable.`;

    const result = await model.generateContent(prompt);
    const output = result.response.text();

    await AISession.create({
      userId: req.userId,
      type: 'weekly_debrief',
      input: { weekApplicationCount: applications.length.toString() },
      output,
    });

    res.json({ output });
  } catch (error) {
    res.status(500).json({ message: 'AI service error', error: String(error) });
  }
});

// GET /api/ai/nudge
router.get('/nudge', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ userId: req.userId });
    const now = new Date();
    const nudges: string[] = [];

    for (const app of applications) {
      const daysSinceUpdate = Math.floor((now.getTime() - new Date(app.updatedAt).getTime()) / (1000 * 60 * 60 * 24));
      if (app.stage === 'applied' && daysSinceUpdate >= 5) {
        nudges.push(`Consider following up on your ${app.role} application at ${app.company} — it's been ${daysSinceUpdate} days.`);
      }
      if (app.nextActionDate && new Date(app.nextActionDate) <= now) {
        nudges.push(`Action overdue for ${app.company} (${app.role}): ${app.nextActionNote || 'Check next steps'}`);
      }
    }

    res.json({ nudges: nudges.slice(0, 3) });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/ai/history
router.get('/history', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const sessions = await AISession.find({ userId: req.userId }).sort({ createdAt: -1 }).limit(20);
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
