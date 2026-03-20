import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import { Project, Chapter } from '../models';
import { generatePdf, generateDocx, generateFountain } from '../services/export';

const router = Router();
router.use(isAuthenticated);

// Export project as PDF
router.get('/:projectId/pdf', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.projectId, userId: (req.user as any).id },
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chapters = await Chapter.findAll({
      where: { projectId: project.id },
      order: [['order', 'ASC']],
    });

    const pdfBuffer = await generatePdf({
      title: project.title,
      author: (req.user as any).name,
      genre: project.genre,
      projectFormat: project.format,
      chapters: chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
      format: 'pdf',
    });

    const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('PDF export error:', error);
    return res.status(500).json({ success: false, error: 'Failed to export PDF' });
  }
});

// Export project as DOCX
router.get('/:projectId/docx', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.projectId, userId: (req.user as any).id },
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chapters = await Chapter.findAll({
      where: { projectId: project.id },
      order: [['order', 'ASC']],
    });

    const docxBuffer = generateDocx({
      title: project.title,
      author: (req.user as any).name,
      genre: project.genre,
      projectFormat: project.format,
      chapters: chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
      format: 'docx',
    });

    const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.doc`;
    res.setHeader('Content-Type', 'application/msword');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(docxBuffer);
  } catch (error) {
    console.error('DOCX export error:', error);
    return res.status(500).json({ success: false, error: 'Failed to export DOCX' });
  }
});

// Export screenplay as Fountain (.fountain)
router.get('/:projectId/fountain', async (req: Request, res: Response) => {
  try {
    const project = await Project.findOne({
      where: { id: req.params.projectId, userId: (req.user as any).id },
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chapters = await Chapter.findAll({
      where: { projectId: project.id },
      order: [['order', 'ASC']],
    });

    const fountainBuffer = generateFountain({
      title: project.title,
      author: (req.user as any).name,
      genre: project.genre,
      chapters: chapters.map((ch) => ({
        title: ch.title,
        content: ch.content,
        order: ch.order,
      })),
      format: 'pdf', // not used for fountain, kept for interface compat
    });

    const filename = `${project.title.replace(/[^a-zA-Z0-9]/g, '_')}.fountain`;
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(fountainBuffer);
  } catch (error) {
    console.error('Fountain export error:', error);
    return res.status(500).json({ success: false, error: 'Failed to export Fountain' });
  }
});

export default router;
