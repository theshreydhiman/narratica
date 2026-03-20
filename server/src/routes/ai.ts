import { Router, Request, Response } from 'express';
import { isAuthenticated } from '../middleware/auth';
import aiService from '../services/ai';
import { Project, Chapter, StoryBible, Character, Outline, WritingSession } from '../models';
import { Op } from 'sequelize';

const router = Router();
router.use(isAuthenticated);

// Track AI interaction by incrementing the latest active session's counter
async function trackAiInteraction(userId: number, projectId?: number) {
  if (!projectId) return;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const session = await WritingSession.findOne({
    where: {
      userId,
      projectId,
      startedAt: { [Op.gte]: today },
      endedAt: { [Op.is]: null as any },
    },
    order: [['startedAt', 'DESC']],
  });

  if (session) {
    session.aiInteractions += 1;
    await session.save();
  }
}

// Generate AI response
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { mode, prompt, projectId, chapterId, maxTokens, temperature } = req.body;

    if (!mode || !prompt) {
      return res.status(400).json({ success: false, error: 'Mode and prompt are required' });
    }

    // Build context from project data
    let context = '';
    if (projectId) {
      const project = await Project.findOne({
        where: { id: projectId, userId: (req.user as any).id },
        include: [
          { model: StoryBible, as: 'storyBible', include: [{ model: Character, as: 'characters' }] },
          { model: Outline, as: 'outline' },
        ],
      });

      if (project) {
        const storyBible = (project as any).storyBible;
        const outline = (project as any).outline;

        context += `Format: ${project.format === 'short_story' ? 'Short Story (under 10,000 words — prioritize economy of language, tight pacing, and impact)' : project.format === 'screenplay' ? 'Screenplay' : 'Novel'}\n`;
        context += `Genre: ${project.genre}\nTitle: ${project.title}\n`;
        if (project.description) context += `Description: ${project.description}\n`;
        if (storyBible) {
          context += `Premise: ${storyBible.premise}\nSetting: ${storyBible.setting}\nThemes: ${storyBible.themes.join(', ')}\n`;
          if (storyBible.characters?.length) {
            context += `Characters:\n${storyBible.characters.map((c: any) => `- ${c.name} (${c.role}): ${c.description || ''}`).join('\n')}\n`;
          }
        }
        if (outline?.beats?.length) {
          context += `Story Beats:\n${outline.beats.map((b: any) => `- ${b.title}: ${b.description}`).join('\n')}\n`;
        }
      }

      if (chapterId) {
        const chapter = await Chapter.findByPk(chapterId);
        if (chapter?.content) {
          const recentText = chapter.content.slice(-2000);
          context += `\nCurrent chapter "${chapter.title}" (recent text):\n${recentText}\n`;
        }
      }
    }

    const result = await aiService.generate({
      mode,
      prompt,
      context: context || undefined,
      maxTokens,
      temperature,
    });

    // Track AI interaction
    await trackAiInteraction((req.user as any).id, projectId);

    return res.json({ success: true, data: { content: result } });
  } catch (error) {
    console.error('AI generation error:', error);
    return res.status(500).json({ success: false, error: 'AI generation failed' });
  }
});

// Brainstorm story idea
router.post('/brainstorm', async (req: Request, res: Response) => {
  try {
    const { idea, genre, format } = req.body;
    const isShortStory = format === 'short_story';
    const prompt = `The user has a story idea: "${idea}"\nGenre: ${genre || 'not specified'}\nFormat: ${format === 'short_story' ? 'Short Story' : format || 'novel'}\n\nHelp them develop this idea further. ${isShortStory ? 'Since this is a short story, focus on a single central conflict, a small cast of characters, and a powerful ending. Suggest ways to keep scope tight.' : 'Ask 3-4 probing questions to flesh out the concept, and suggest 2-3 unique angles or twists they might consider.'} Keep it conversational and encouraging.`;

    const result = await aiService.generate({ mode: 'brainstorm', prompt });
    return res.json({ success: true, data: { content: result } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Brainstorming failed' });
  }
});

// Generate character profiles
router.post('/generate-characters', async (req: Request, res: Response) => {
  try {
    const { premise, genre, existingCharacters, format } = req.body;
    const isShortStory = format === 'short_story';
    let prompt = `Based on this story premise: "${premise}"\nGenre: ${genre}\nFormat: ${isShortStory ? 'Short Story' : format || 'Novel'}\n\n`;
    if (existingCharacters?.length) {
      prompt += `Existing characters: ${existingCharacters.map((c: any) => c.name).join(', ')}\n\n`;
    }
    prompt += isShortStory
      ? `Suggest 2-3 focused characters for a short story. Keep the cast small — a protagonist, an antagonist or foil, and optionally one supporting character. Each needs a name, role (protagonist/antagonist/supporting), brief description, personality traits, and potential character arc. Return as structured JSON array with fields: name, role, description, personality, arc.`
      : `Suggest 3-4 compelling characters with name, role (protagonist/antagonist/supporting), brief description, personality traits, and potential character arc. Return as structured JSON array with fields: name, role, description, personality, arc.`;

    const result = await aiService.generate({ mode: 'brainstorm', prompt, temperature: 0.8 });
    return res.json({ success: true, data: { content: result } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Character generation failed' });
  }
});

// Generate outline
router.post('/generate-outline', async (req: Request, res: Response) => {
  try {
    const { premise, genre, characters, structureType, format } = req.body;
    const structureNames: Record<string, string> = {
      three_act: 'Three-Act Structure',
      hero_journey: "Hero's Journey",
      save_the_cat: 'Save the Cat beat sheet',
      snowflake: 'Snowflake Method',
      // Short story structures
      freytag: "Freytag's Pyramid (Exposition → Rising Action → Climax → Falling Action → Resolution)",
      kishōtenketsu: 'Kishōtenketsu (Introduction → Development → Twist → Reconciliation)',
      in_medias_res: 'In Medias Res (Start in the middle, then unfold)',
      vonnegut_arc: "Vonnegut's Story Shape (simple emotional arc)",
    };

    const isShortStory = format === 'short_story';
    const defaultStructure = isShortStory ? 'freytag' : 'three_act';
    const unitLabel = isShortStory ? 'section' : 'chapter';

    const prompt = `Create a ${structureNames[structureType] || structureNames[defaultStructure]} outline for this ${isShortStory ? 'short story (under 10,000 words — keep it tight and focused)' : 'story'}:\n\nPremise: ${premise}\nGenre: ${genre}\nCharacters: ${characters?.map((c: any) => `${c.name} (${c.role})`).join(', ') || 'TBD'}\n\nGenerate a detailed ${unitLabel}-by-${unitLabel} outline with story beats. ${isShortStory ? 'Keep it concise — a short story typically has 3-5 sections. Focus on a single conflict and tight resolution.' : ''} For each beat, include: act number, title, and description. Return as a JSON array with fields: act, title, description, order.`;

    const result = await aiService.generate({ mode: 'brainstorm', prompt, maxTokens: 4096, temperature: 0.7 });
    return res.json({ success: true, data: { content: result } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Outline generation failed' });
  }
});

// Critique a chapter
router.post('/critique', async (req: Request, res: Response) => {
  try {
    const { chapterId, projectId, focusArea } = req.body;

    if (!chapterId) {
      return res.status(400).json({ success: false, error: 'chapterId is required' });
    }

    const project = await Project.findOne({
      where: { id: projectId, userId: (req.user as any).id },
      include: [
        { model: StoryBible, as: 'storyBible', include: [{ model: Character, as: 'characters' }] },
        { model: Outline, as: 'outline' },
      ],
    });
    if (!project) return res.status(404).json({ success: false, error: 'Project not found' });

    const chapter = await Chapter.findByPk(chapterId);
    if (!chapter || chapter.projectId !== project.id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }

    if (!chapter.content || chapter.content.trim().length < 50) {
      return res.status(400).json({ success: false, error: 'Chapter needs more content before it can be critiqued' });
    }

    // Build rich context
    const storyBible = (project as any).storyBible;
    const outline = (project as any).outline;

    let context = `Format: ${project.format === 'short_story' ? 'Short Story' : project.format === 'screenplay' ? 'Screenplay' : 'Novel'}\n`;
    context += `Genre: ${project.genre}\nTitle: ${project.title}\n`;
    if (project.description) context += `Description: ${project.description}\n`;
    if (storyBible) {
      context += `Premise: ${storyBible.premise}\nThemes: ${storyBible.themes?.join(', ') || 'N/A'}\n`;
      if (storyBible.characters?.length) {
        context += `Characters: ${storyBible.characters.map((c: any) => `${c.name} (${c.role})`).join(', ')}\n`;
      }
    }
    if (outline?.beats?.length) {
      context += `Story Beats: ${outline.beats.map((b: any) => b.title).join(' → ')}\n`;
    }

    // Strip HTML for analysis
    const plainText = chapter.content
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const focusPrompts: Record<string, string> = {
      pacing: 'Focus your analysis on PACING. Identify sections that drag or rush. Suggest where to expand, compress, or add scene breaks.',
      dialogue: 'Focus your analysis on DIALOGUE. Evaluate whether characters have distinct voices, if dialogue feels natural, and whether conversations advance the plot or reveal character.',
      show_not_tell: 'Focus your analysis on SHOW vs TELL. Find passages where the author tells emotions or states rather than showing them through action, dialogue, or sensory detail. Provide rewrites.',
      character: 'Focus your analysis on CHARACTER CONSISTENCY. Check whether characters act in ways consistent with their established traits, if motivations are clear, and if arcs are progressing.',
      opening: 'Focus your analysis on the OPENING. Does it hook the reader? Is the inciting incident clear? Does the first paragraph make you want to read more?',
      overall: 'Provide a comprehensive critique covering: pacing, character voice, show-vs-tell, prose quality, and narrative tension. Highlight 2-3 strengths and 2-3 areas for improvement.',
    };

    const focusInstruction = focusPrompts[focusArea] || focusPrompts.overall;

    const prompt = `Analyze this chapter titled "${chapter.title}":\n\n---\n${plainText.slice(0, 6000)}\n---\n\n${focusInstruction}\n\nStructure your response as:\n## Strengths\n- (bullet points)\n\n## Areas for Improvement\n- (bullet points with specific examples from the text)\n\n## Suggestions\n- (actionable rewrites or techniques)\n\nBe specific — quote the text when pointing out issues. Be encouraging but honest.`;

    const result = await aiService.generate({
      mode: 'critique',
      prompt,
      context,
      maxTokens: 3000,
      temperature: 0.6,
    });

    // Save critique to chapter
    await chapter.update({ aiCritique: result });

    // Track AI interaction
    await trackAiInteraction((req.user as any).id, projectId);

    return res.json({ success: true, data: { critique: result, chapterId: chapter.id } });
  } catch (error) {
    console.error('AI critique error:', error);
    return res.status(500).json({ success: false, error: 'AI critique failed' });
  }
});

// Get saved critique for a chapter
router.get('/critique/:chapterId', async (req: Request, res: Response) => {
  try {
    const chapter = await Chapter.findByPk(parseInt(req.params.chapterId as string), {
      include: [{ model: Project, as: 'project', attributes: ['userId'] }],
    });
    if (!chapter || (chapter as any).project.userId !== (req.user as any).id) {
      return res.status(404).json({ success: false, error: 'Chapter not found' });
    }
    return res.json({ success: true, data: { critique: chapter.aiCritique || null } });
  } catch (error) {
    return res.status(500).json({ success: false, error: 'Failed to fetch critique' });
  }
});

export default router;
