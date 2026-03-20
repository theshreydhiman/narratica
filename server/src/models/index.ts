import User from './User';
import Project from './Project';
import StoryBible from './StoryBible';
import Character from './Character';
import Outline from './Outline';
import Chapter from './Chapter';
import Version from './Version';
import WritingSession from './WritingSession';
import Achievement from './Achievement';

// User -> Projects
User.hasMany(Project, { foreignKey: 'userId', as: 'projects' });
Project.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Project -> StoryBible
Project.hasOne(StoryBible, { foreignKey: 'projectId', as: 'storyBible' });
StoryBible.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// StoryBible -> Characters
StoryBible.hasMany(Character, { foreignKey: 'storyBibleId', as: 'characters' });
Character.belongsTo(StoryBible, { foreignKey: 'storyBibleId', as: 'storyBible' });

// Project -> Outline
Project.hasOne(Outline, { foreignKey: 'projectId', as: 'outline' });
Outline.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Project -> Chapters
Project.hasMany(Chapter, { foreignKey: 'projectId', as: 'chapters' });
Chapter.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// Chapter -> Versions
Chapter.hasMany(Version, { foreignKey: 'chapterId', as: 'versions' });
Version.belongsTo(Chapter, { foreignKey: 'chapterId', as: 'chapter' });

// User -> WritingSessions
User.hasMany(WritingSession, { foreignKey: 'userId', as: 'writingSessions' });
WritingSession.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Project.hasMany(WritingSession, { foreignKey: 'projectId', as: 'writingSessions' });
WritingSession.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });

// User -> Achievements
User.hasMany(Achievement, { foreignKey: 'userId', as: 'achievements' });
Achievement.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export { User, Project, StoryBible, Character, Outline, Chapter, Version, WritingSession, Achievement };
