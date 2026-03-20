import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ProjectAttributes {
  id: number;
  userId: number;
  title: string;
  description?: string;
  format: 'novel' | 'screenplay' | 'short_story';
  genre: string;
  status: 'spark' | 'blueprint' | 'draft' | 'refine' | 'polish' | 'complete';
  targetWordCount?: number;
  currentWordCount: number;
  aiStylePrefs?: object;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'targetWordCount' | 'aiStylePrefs' | 'currentWordCount'> {}

class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public userId!: number;
  public title!: string;
  public description?: string;
  public format!: 'novel' | 'screenplay' | 'short_story';
  public genre!: string;
  public status!: 'spark' | 'blueprint' | 'draft' | 'refine' | 'polish' | 'complete';
  public targetWordCount?: number;
  public currentWordCount!: number;
  public aiStylePrefs?: object;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Project.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.TEXT, allowNull: true },
    format: { type: DataTypes.ENUM('novel', 'screenplay', 'short_story'), allowNull: false, defaultValue: 'novel' },
    genre: { type: DataTypes.STRING(100), allowNull: false },
    status: { type: DataTypes.ENUM('spark', 'blueprint', 'draft', 'refine', 'polish', 'complete'), allowNull: false, defaultValue: 'spark' },
    targetWordCount: { type: DataTypes.INTEGER, allowNull: true },
    currentWordCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    aiStylePrefs: { type: DataTypes.JSON, allowNull: true },
  },
  { sequelize, tableName: 'projects', timestamps: true }
);

export default Project;
