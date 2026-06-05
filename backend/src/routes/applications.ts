import { Router, Response } from 'express';
import { Application } from '../models/mongo/Application';
import { Notification } from '../models/mongo/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/applications
router.get('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { stage, priority, search } = req.query;
    const filter: Record<string, unknown> = { userId: req.userId };
    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (search) {
      filter.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
      ];
    }
    const applications = await Application.find(filter).sort({ updatedAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/applications
router.post('/', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.create({ ...req.body, userId: req.userId });
    res.status(201).json(app);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/applications/:id
router.get('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.userId });
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/applications/:id
router.put('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { ...req.body },
      { new: true }
    );
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }

    // Create notification on stage change
    if (req.body.stage) {
      await Notification.create({
        userId: req.userId,
        type: 'stage_change',
        title: `${app.company} — Stage Updated`,
        message: `Your application at ${app.company} moved to ${req.body.stage}`,
        applicationId: app._id.toString(),
      });
    }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// DELETE /api/applications/:id
router.delete('/:id', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    res.json({ message: 'Application deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PATCH /api/applications/:id/stage
router.patch('/:id/stage', async (req: AuthRequest, res: Response): Promise<void> => {
  const { stage } = req.body;
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      {
        stage,
        $push: {
          timeline: { event: `Moved to ${stage}`, date: new Date(), source: 'manual' },
        },
      },
      { new: true }
    );
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/applications/:id/timeline
router.post('/:id/timeline', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $push: { timeline: { ...req.body, source: 'manual', date: new Date() } } },
      { new: true }
    );
    if (!app) { res.status(404).json({ message: 'Application not found' }); return; }
    res.json(app);
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
