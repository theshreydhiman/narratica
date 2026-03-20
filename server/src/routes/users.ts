import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { User, WritingSession, Achievement, Project } from '../models';
import { Op } from 'sequelize';
import { processAchievements } from '../services/gamification';

const router = Router();
router.use(isAuthenticated);

// Get user profile with stats
router.get('/profile', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const projects = await Project.findAll({ where: { userId: user.id } });
    const achievements = await Achievement.findAll({ where: { userId: user.id }, order: [['unlockedAt', 'DESC']] });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentSessions = await WritingSession.findAll({
      where: { userId: user.id, startedAt: { [Op.gte]: weekAgo } },
    });

    const weeklyWords = recentSessions.reduce((sum, s) => sum + s.wordsWritten, 0);
    const weeklySessionCount = recentSessions.length;

    const { password: _, ...userData } = user.toJSON();

    return res.json({
      success: true,
      data: {
        user: userData,
        stats: {
          totalProjects: projects.length,
          activeProjects: projects.filter(p => !['complete'].includes(p.status)).length,
          weeklyWords,
          weeklySessionCount,
          achievements: achievements.length,
        },
        achievements,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch profile' });
  }
});

// Update user profile
router.put('/profile', async (req: Request, res: Response) => {
  try {
    const user = req.user as any;
    const { name, skillLevel, onboardingComplete } = req.body;
    await user.update({ name, skillLevel, onboardingComplete });
    const { password: _, ...userData } = user.toJSON();
    return res.json({ success: true, data: { user: userData } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update profile' });
  }
});

// Record writing session
router.post('/sessions', async (req: Request, res: Response) => {
  try {
    const { projectId, wordsWritten, aiInteractions, startedAt, endedAt } = req.body;
    const session = await WritingSession.create({
      userId: (req.user as any).id,
      projectId,
      wordsWritten: wordsWritten || 0,
      aiInteractions: aiInteractions || 0,
      startedAt: startedAt ? new Date(startedAt) : new Date(),
      endedAt: endedAt ? new Date(endedAt) : undefined,
    });

    // Update user's total words and streak
    const user = req.user as any;
    user.totalWords += wordsWritten || 0;

    const today = new Date().toISOString().split('T')[0];
    const lastDate = user.lastWritingDate;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (lastDate === yesterdayStr) {
      user.streakCount += 1;
    } else if (lastDate !== today) {
      user.streakCount = 1;
    }
    user.lastWritingDate = today;
    await user.save();

    // Check for new achievements (also emits socket events)
    const newAchievements = await processAchievements(user.id);

    return res.status(201).json({ success: true, data: { session, newAchievements } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to record session' });
  }
});

export default router;
