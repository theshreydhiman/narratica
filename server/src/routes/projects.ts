import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { Project, StoryBible, Character, Outline, Chapter } from '../models';
import { processAchievements } from '../services/gamification';
import sequelize from 'sequelize';

const router = Router();
router.use(isAuthenticated);

// List user's projects
router.get('/', async (req: Request, res: Response) => {
  try {
    const projects = await Project.findAll({
      where: { userId: (req.user as any).id },
      include: [{ model: Chapter, as: 'chapters', attributes: ['id', 'title', 'order', 'status', 'wordCount'] }],
      order: [['updatedAt', 'DESC']],
    });
    return res.json({ success: true, data: projects });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch projects' });
  }
});

// Get single project with all related data
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: (req.user as any).id },
      include: [
        { model: StoryBible, as: 'storyBible', include: [{ model: Character, as: 'characters' }] },
        { model: Outline, as: 'outline' },
        {
          model: Chapter,
          as: 'chapters',
          attributes: {
            exclude: ['content', 'aiCritique'],
            include: [[sequelize.literal('CASE WHEN aiCritique IS NOT NULL AND aiCritique != \'\' THEN 1 ELSE 0 END'), 'hasCritique']],
          },
          order: [['order', 'ASC']],
        },
      ],
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    return res.json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch project' });
  }
});

// Create project
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, description, format, genre, targetWordCount, aiStylePrefs } = req.body;
    const project = await Project.create({
      userId: (req.user as any).id,
      title,
      description,
      format: format || 'novel',
      genre,
      status: 'spark',
      targetWordCount,
      currentWordCount: 0,
      aiStylePrefs,
    });

    // Check achievements (first_project milestone)
    await processAchievements((req.user as any).id);

    return res.status(201).json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create project' });
  }
});

// Update project
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    const wasPreviouslyComplete = project.status === 'complete';
    await project.update(req.body);

    // Check achievements when project status changes to complete
    if (project.status === 'complete' && !wasPreviouslyComplete) {
      await processAchievements((req.user as any).id);
    }

    return res.json({ success: true, data: project });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update project' });
  }
});

// Delete project
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    await project.destroy();
    return res.json({ success: true, message: 'Project deleted' });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to delete project' });
  }
});

// Story Bible endpoints
router.post('/:id/story-bible', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const storyBible = await StoryBible.create({ projectId: project.id, ...req.body });
    return res.status(201).json({ success: true, data: storyBible });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create story bible' });
  }
});

router.put('/:id/story-bible', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const storyBible = await StoryBible.findOne({ where: { projectId: project.id } });
    if (!storyBible) return res.status(404).json({ success: false, error: 'Story bible not found' });

    await storyBible.update(req.body);
    return res.json({ success: true, data: storyBible });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update story bible' });
  }
});

// Character endpoints
router.post('/:id/characters', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.id, userId: (req.user as any).id },
      include: [{ model: StoryBible, as: 'storyBible' }],
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });
    const storyBible = (project as any).storyBible;
    if (!storyBible) return res.status(404).json({ success: false, error: 'Create a story bible first' });

    const character = await Character.create({ storyBibleId: storyBible.id, ...req.body });
    return res.status(201).json({ success: true, data: character });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create character' });
  }
});

// Outline endpoints
router.post('/:id/outline', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const outline = await Outline.create({ projectId: project.id, ...req.body });
    return res.status(201).json({ success: true, data: outline });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to create outline' });
  }
});

router.put('/:id/outline', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({ where: { id: req.params.id, userId: (req.user as any).id } });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const outline = await Outline.findOne({ where: { projectId: project.id } });
    if (!outline) return res.status(404).json({ success: false, error: 'Outline not found' });

    await outline.update(req.body);
    return res.json({ success: true, data: outline });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to update outline' });
  }
});

export default router;
