import { Router, Response } from 'express';
import { Application } from '../models/mongo/Application';
import { User } from '../models/mongo/User';
import { Notification } from '../models/mongo/Notification';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// GET /api/analytics/overview
router.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ userId: req.userId });

    const stageCounts: Record<string, number> = {
      wishlist: 0, applied: 0, screening: 0, interview: 0, offer: 0, rejected: 0,
    };
    applications.forEach(app => { stageCounts[app.stage] = (stageCounts[app.stage] || 0) + 1; });

    const totalApplied = applications.filter(a => a.stage !== 'wishlist').length;
    const responded = applications.filter(a => ['screening', 'interview', 'offer', 'rejected'].includes(a.stage)).length;
    const responseRate = totalApplied > 0 ? Math.round((responded / totalApplied) * 100) : 0;

    // Weekly activity (last 7 days)
    const weeklyActivity: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const count = applications.filter(app => new Date(app.createdAt).toISOString().split('T')[0] === dateStr).length;
      weeklyActivity.push({ date: dateStr, count });
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const hotApplications = applications
      .filter(app => ['applied', 'screening', 'interview'].includes(app.stage))
      .filter(app => new Date(app.updatedAt) >= sevenDaysAgo)
      .slice(0, 5)
      .map(app => ({ _id: app._id, company: app.company, role: app.role, stage: app.stage, updatedAt: app.updatedAt, nextActionDate: app.nextActionDate }));

    // Get goal from user document
    const user = await User.findById(req.userId);
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const thisWeekCount = applications.filter(app => new Date(app.createdAt) >= weekStart && app.stage !== 'wishlist').length;
    const weeklyGoal = user?.weeklyGoal || 10;

    res.json({
      total: applications.length,
      stageCounts,
      responseRate,
      weeklyActivity,
      hotApplications,
      goal: {
        target: weeklyGoal,
        current: thisWeekCount,
        percentage: Math.min(Math.round((thisWeekCount / weeklyGoal) * 100), 100),
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/analytics/time-in-stage
router.get('/time-in-stage', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const applications = await Application.find({ userId: req.userId });
    const stageMap: Record<string, number[]> = {};
    applications.forEach(app => {
      const timeline = app.timeline;
      for (let i = 0; i < timeline.length - 1; i++) {
        const stage = timeline[i].event;
        const duration = new Date(timeline[i + 1].date).getTime() - new Date(timeline[i].date).getTime();
        const days = Math.round(duration / (1000 * 60 * 60 * 24));
        if (!stageMap[stage]) stageMap[stage] = [];
        stageMap[stage].push(days);
      }
    });
    const avgTimeInStage = Object.entries(stageMap).map(([stage, days]) => ({
      stage,
      avgDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
    }));
    res.json(avgTimeInStage);
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// PUT /api/analytics/goal
router.put('/goal', async (req: AuthRequest, res: Response): Promise<void> => {
  const { weeklyTarget } = req.body;
  try {
    await User.findByIdAndUpdate(req.userId, { weeklyGoal: weeklyTarget });
    res.json({ message: 'Goal updated', weeklyTarget });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
