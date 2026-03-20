import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { Project, Chapter, Version, User } from '../models';
import { processAchievements } from '../services/gamification';

const router = Router();
router.use(isAuthenticated);

// Get chapter with content
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.id as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    return res.json({ success: true, data: chapter });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch chapter' });
  }
});

// Create chapter
router.post('/', async (req: Request, res: Response) => {
  try {
    const { projectId, title, order } = req.body;
    const project = await Project.findOne({ where: { id: projectId, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chapter = await Chapter.create({ projectId, title, order, content: '', status: 'planned' });
    return res.status(201).json({ success: true, data: chapter });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create chapter' });
  }
});

// Update chapter (save content)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.id as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    // Auto-calculate word count
    if (req.body.content !== undefined) {
      req.body.wordCount = req.body.content.trim().split(/\s+/).filter(Boolean).length;
    }

    const oldWordCount = chapter.wordCount || 0;
    await chapter.update(req.body);
    const newWordCount = chapter.wordCount || 0;
    const wordDelta = Math.max(0, newWordCount - oldWordCount);

    // Update project's current word count
    const allChapters = await Chapter.findAll({ where: { projectId: chapter.projectId } });
    const totalWords = allChapters.reduce((sum, ch) => sum + ch.wordCount, 0);
    await Project.update({ currentWordCount: totalWords }, { where: { id: chapter.projectId } });

    // Update user's totalWords and check achievements
    if (wordDelta > 0) {
      const user = await User.findByPk((req.user as any).id);
      if (user) {
        user.totalWords += wordDelta;

        // Update streak
        const today = new Date().toISOString().split('T')[0];
        const lastDate = user.lastWritingDate ? String(user.lastWritingDate) : null;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastDate === yesterdayStr) {
          user.streakCount += 1;
        } else if (lastDate !== today) {
          user.streakCount = 1;
        }
        user.lastWritingDate = new Date(today) as any;
        await user.save();

        // Process achievements (also emits socket events)
        await processAchievements(user.id);
      }
    }

    return res.json({ success: true, data: chapter });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update chapter' });
  }
});

// Delete chapter
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.id as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    await chapter.destroy();
    return res.json({ success: true, message: 'Chapter deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete chapter' });
  }
});

// Save version (snapshot)
router.post('/:id/versions', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.id as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const version = await Version.create({
      chapterId: chapter.id,
      content: chapter.content,
      wordCount: chapter.wordCount,
    });
    return res.status(201).json({ success: true, data: version });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create version' });
  }
});

// List versions
router.get('/:id/versions', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.id as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    const versions = await Version.findAll({
      where: { chapterId: chapter.id },
      attributes: ['id', 'wordCount', 'createdAt'],
      order: [['createdAt', 'DESC']],
    });
    return res.json({ success: true, data: versions });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch versions' });
  }
});

export default router;
