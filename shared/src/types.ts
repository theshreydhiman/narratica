// User
export interface User {
  id: number;
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  skillLevel: 'beginner' | 'intermediate' | 'experienced';
  onboardingComplete: boolean;
  streakCount: number;
  lastWritingDate?: string;
  totalWords: number;
  createdAt: string;
  updatedAt: string;
}

// Project
export type ProjectFormat = 'novel' | 'screenplay' | 'short_story';
export type ProjectStatus = 'spark' | 'blueprint' | 'draft' | 'refine' | 'polish' | 'complete';

export interface Project {
  id: number;
  userId: number;
  title: string;
  description?: string;
  format: ProjectFormat;
  genre: string;
  status: ProjectStatus;
  targetWordCount?: number;
  currentWordCount: number;
  aiStylePrefs?: AiStylePrefs;
  createdAt: string;
  updatedAt: string;
}

export interface AiStylePrefs {
  tone: string;
  pov: string;
  complexity: string;
  themes: string[];
}

// Story Bible
export interface StoryBible {
  id: number;
  projectId: number;
  premise: string;
  themes: string[];
  setting: string;
  timePeriod: string;
  worldRules?: string;
  createdAt: string;
  updatedAt: string;
}

// Character
export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor';

export interface Character {
  id: number;
  storyBibleId: number;
  name: string;
  role: CharacterRole;
  age?: string;
  description?: string;
  backstory?: string;
  personality?: string;
  arc?: string;
  relationships: CharacterRelationship[];
  createdAt: string;
  updatedAt: string;
}

export interface CharacterRelationship {
  characterId: number;
  characterName: string;
  relationship: string;
}

// Outline
export type StructureType = 'three_act' | 'hero_journey' | 'save_the_cat' | 'snowflake' | 'custom';

export interface Outline {
  id: number;
  projectId: number;
  structureType: StructureType;
  beats: OutlineBeat[];
  createdAt: string;
  updatedAt: string;
}

export interface OutlineBeat {
  id: string;
  act: number;
  title: string;
  description: string;
  order: number;
}

// Chapter
export type ChapterStatus = 'planned' | 'in_progress' | 'first_draft' | 'revised' | 'final';

export interface Chapter {
  id: number;
  projectId: number;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  status: ChapterStatus;
  aiCritique?: string;
  createdAt: string;
  updatedAt: string;
}

// Version
export interface Version {
  id: number;
  chapterId: number;
  content: string;
  wordCount: number;
  createdAt: string;
}

// Writing Session
export interface WritingSession {
  id: number;
  userId: number;
  projectId: number;
  startedAt: string;
  endedAt?: string;
  wordsWritten: number;
  aiInteractions: number;
}

// Achievement
export type AchievementType = 'streak' | 'word_count' | 'chapter' | 'project' | 'special';

export interface Achievement {
  id: number;
  userId: number;
  type: AchievementType;
  milestone: string;
  description: string;
  unlockedAt: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// AI types
export type AiMode = 'brainstorm' | 'co_write' | 'critique' | 'teach' | 'format';
export type AiProvider = 'groq' | 'ollama';

export interface AiRequest {
  mode: AiMode;
  prompt: string;
  context?: AiContext;
  provider?: AiProvider;
  stream?: boolean;
}

export interface AiContext {
  projectId: number;
  chapterId?: number;
  genre?: string;
  tone?: string;
  characters?: string[];
  recentText?: string;
  outlineBeat?: string;
}

export interface AiResponse {
  content: string;
  provider: AiProvider;
  tokensUsed?: number;
}

// Auth types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  skillLevel: 'beginner' | 'intermediate' | 'experienced';
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
}

// Wizard types
export interface WizardState {
  step: number;
  idea: string;
  genre: string;
  characters: Partial<Character>[];
  setting: Partial<StoryBible>;
  outline: Partial<Outline>;
}
