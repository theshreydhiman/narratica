-- ============================================
-- Narratica Database Initialization Script
-- ============================================
-- Run this script to create the database and all tables.
-- Usage: mysql -u root -p < server/src/db.sql
-- ============================================

CREATE DATABASE IF NOT EXISTS narratica
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE narratica;

-- ============================================
-- 1. Users
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  password VARCHAR(255) NULL,
  googleId VARCHAR(255) NULL UNIQUE,
  avatarUrl VARCHAR(500) NULL,
  skillLevel ENUM('beginner', 'intermediate', 'experienced') NOT NULL DEFAULT 'beginner',
  onboardingComplete BOOLEAN NOT NULL DEFAULT FALSE,
  streakCount INT NOT NULL DEFAULT 0,
  lastWritingDate DATE NULL,
  totalWords INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 2. Projects
-- ============================================
CREATE TABLE IF NOT EXISTS projects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NULL,
  format ENUM('novel', 'screenplay', 'short_story') NOT NULL DEFAULT 'novel',
  genre VARCHAR(100) NOT NULL,
  status ENUM('spark', 'blueprint', 'draft', 'refine', 'polish', 'complete') NOT NULL DEFAULT 'spark',
  targetWordCount INT NULL,
  currentWordCount INT NOT NULL DEFAULT 0,
  aiStylePrefs JSON NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 3. Story Bibles
-- ============================================
CREATE TABLE IF NOT EXISTS story_bibles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL UNIQUE,
  premise TEXT NOT NULL,
  themes JSON NOT NULL DEFAULT ('[]'),
  setting TEXT NOT NULL,
  timePeriod VARCHAR(255) NOT NULL,
  worldRules TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 4. Characters
-- ============================================
CREATE TABLE IF NOT EXISTS characters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  storyBibleId INT NOT NULL,
  name VARCHAR(255) NOT NULL,
  role ENUM('protagonist', 'antagonist', 'supporting', 'minor') NOT NULL,
  age VARCHAR(50) NULL,
  description TEXT NULL,
  backstory TEXT NULL,
  personality TEXT NULL,
  arc TEXT NULL,
  relationships JSON NOT NULL DEFAULT ('[]'),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (storyBibleId) REFERENCES story_bibles(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 5. Outlines
-- ============================================
CREATE TABLE IF NOT EXISTS outlines (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL UNIQUE,
  structureType ENUM('three_act', 'hero_journey', 'save_the_cat', 'snowflake', 'custom') NOT NULL DEFAULT 'three_act',
  beats JSON NOT NULL DEFAULT ('[]'),
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 6. Chapters
-- ============================================
CREATE TABLE IF NOT EXISTS chapters (
  id INT AUTO_INCREMENT PRIMARY KEY,
  projectId INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  `order` INT NOT NULL,
  content LONGTEXT NOT NULL,
  wordCount INT NOT NULL DEFAULT 0,
  status ENUM('planned', 'in_progress', 'first_draft', 'revised', 'final') NOT NULL DEFAULT 'planned',
  aiCritique TEXT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 7. Versions (chapter snapshots)
-- ============================================
CREATE TABLE IF NOT EXISTS versions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  chapterId INT NOT NULL,
  content LONGTEXT NOT NULL,
  wordCount INT NOT NULL DEFAULT 0,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (chapterId) REFERENCES chapters(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 8. Writing Sessions
-- ============================================
CREATE TABLE IF NOT EXISTS writing_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  projectId INT NOT NULL,
  startedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  endedAt DATETIME NULL,
  wordsWritten INT NOT NULL DEFAULT 0,
  aiInteractions INT NOT NULL DEFAULT 0,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  FOREIGN KEY (projectId) REFERENCES projects(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- 9. Achievements
-- ============================================
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  userId INT NOT NULL,
  type ENUM('streak', 'word_count', 'chapter', 'project', 'special') NOT NULL,
  milestone VARCHAR(255) NOT NULL,
  description VARCHAR(500) NOT NULL,
  unlockedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Indexes for performance
-- ============================================
CREATE INDEX idx_projects_userId ON projects(userId);
CREATE INDEX idx_chapters_projectId ON chapters(projectId);
CREATE INDEX idx_chapters_order ON chapters(projectId, `order`);
CREATE INDEX idx_versions_chapterId ON versions(chapterId);
CREATE INDEX idx_writing_sessions_userId ON writing_sessions(userId);
CREATE INDEX idx_writing_sessions_projectId ON writing_sessions(projectId);
CREATE INDEX idx_writing_sessions_startedAt ON writing_sessions(startedAt);
CREATE INDEX idx_achievements_userId ON achievements(userId);
CREATE INDEX idx_characters_storyBibleId ON characters(storyBibleId);
