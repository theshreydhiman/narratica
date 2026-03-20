import { Achievement, User, Project, Chapter } from '../models';
import type { Server as SocketServer } from 'socket.io';

interface MilestoneCheck {
  type: 'streak' | 'word_count' | 'chapter' | 'project' | 'special';
  milestone: string;
  description: string;
  condition: (stats: UserStats) => boolean;
}

export interface UserStats {
  totalWords: number;
  streakCount: number;
  chaptersCompleted: number;
  projectsCompleted: number;
  projectsCreated: number;
}

let _io: SocketServer | null = null;

export function setSocketServer(io: SocketServer) {
  _io = io;
}

const MILESTONES: MilestoneCheck[] = [
  // Word count milestones
  { type: 'word_count', milestone: 'first_100', description: 'Wrote your first 100 words', condition: (s) => s.totalWords >= 100 },
  { type: 'word_count', milestone: 'first_1000', description: 'Reached 1,000 words', condition: (s) => s.totalWords >= 1000 },
  { type: 'word_count', milestone: 'first_5000', description: 'Reached 5,000 words', condition: (s) => s.totalWords >= 5000 },
  { type: 'word_count', milestone: 'first_10000', description: 'Reached 10,000 words', condition: (s) => s.totalWords >= 10000 },
  { type: 'word_count', milestone: 'first_25000', description: 'Reached 25,000 words — halfway to a novel!', condition: (s) => s.totalWords >= 25000 },
  { type: 'word_count', milestone: 'first_50000', description: 'Reached 50,000 words — NaNoWriMo complete!', condition: (s) => s.totalWords >= 50000 },
  { type: 'word_count', milestone: 'first_80000', description: 'Reached 80,000 words — full novel length!', condition: (s) => s.totalWords >= 80000 },

  // Streak milestones
  { type: 'streak', milestone: 'streak_3', description: '3-day writing streak', condition: (s) => s.streakCount >= 3 },
  { type: 'streak', milestone: 'streak_7', description: '7-day writing streak — one full week!', condition: (s) => s.streakCount >= 7 },
  { type: 'streak', milestone: 'streak_14', description: '14-day writing streak', condition: (s) => s.streakCount >= 14 },
  { type: 'streak', milestone: 'streak_30', description: '30-day writing streak — a full month!', condition: (s) => s.streakCount >= 30 },

  // Chapter milestones
  { type: 'chapter', milestone: 'first_chapter', description: 'Completed your first chapter', condition: (s) => s.chaptersCompleted >= 1 },
  { type: 'chapter', milestone: 'five_chapters', description: 'Completed 5 chapters', condition: (s) => s.chaptersCompleted >= 5 },
  { type: 'chapter', milestone: 'ten_chapters', description: 'Completed 10 chapters', condition: (s) => s.chaptersCompleted >= 10 },

  // Project milestones
  { type: 'project', milestone: 'first_project', description: 'Created your first project', condition: (s) => s.projectsCreated >= 1 },
  { type: 'project', milestone: 'first_complete', description: 'Completed your first project!', condition: (s) => s.projectsCompleted >= 1 },

  // Special
  { type: 'special', milestone: 'getting_started', description: 'Welcome to Narratica!', condition: () => true },
];

export async function checkAndAwardAchievements(userId: number, stats: UserStats): Promise<Achievement[]> {
  const existing = await Achievement.findAll({ where: { userId } });
  const existingMilestones = new Set(existing.map((a) => a.milestone));

  const newAchievements: Achievement[] = [];

  for (const milestone of MILESTONES) {
    if (existingMilestones.has(milestone.milestone)) continue;
    if (milestone.condition(stats)) {
      const achievement = await Achievement.create({
        userId,
        type: milestone.type,
        milestone: milestone.milestone,
        description: milestone.description,
      });
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
}

export function getMilestoneInfo(milestone: string): MilestoneCheck | undefined {
  return MILESTONES.find((m) => m.milestone === milestone);
}

/**
 * Gather current gamification stats for a user from the database.
 */
export async function getUserStats(userId: number): Promise<UserStats> {
  const user = await User.findByPk(userId);
  if (!user) throw new Error('User not found');

  const projects = await Project.findAll({ where: { userId } });
  const projectIds = projects.map(p => p.id);

  const chaptersCompleted = projectIds.length > 0
    ? await Chapter.count({ where: { projectId: projectIds, status: ['first_draft', 'revised', 'final'] } })
    : 0;

  return {
    totalWords: user.totalWords,
    streakCount: user.streakCount,
    chaptersCompleted,
    projectsCompleted: projects.filter(p => p.status === 'complete').length,
    projectsCreated: projects.length,
  };
}

/**
 * Full pipeline: gather stats, check achievements, emit socket events for new ones.
 * Returns newly awarded achievements.
 */
export async function processAchievements(userId: number): Promise<Achievement[]> {
  const stats = await getUserStats(userId);
  const newAchievements = await checkAndAwardAchievements(userId, stats);

  // Emit real-time notifications for each new achievement
  if (newAchievements.length > 0 && _io) {
    _io.to(`user:${userId}`).emit('achievement-unlocked', {
      achievements: newAchievements.map(a => ({
        id: a.id,
        type: a.type,
        milestone: a.milestone,
        description: a.description,
      })),
    });
  }

  return newAchievements;
}

export { MILESTONES };
