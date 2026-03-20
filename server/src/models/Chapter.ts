import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface ChapterAttributes {
  id: number;
  projectId: number;
  title: string;
  order: number;
  content: string;
  wordCount: number;
  status: 'planned' | 'in_progress' | 'first_draft' | 'revised' | 'final';
  aiCritique?: string;
}

interface ChapterCreationAttributes extends Optional<ChapterAttributes, 'id' | 'content' | 'wordCount' | 'aiCritique'> {}

class Chapter extends Model<ChapterAttributes, ChapterCreationAttributes> implements ChapterAttributes {
  public id!: number;
  public projectId!: number;
  public title!: string;
  public order!: number;
  public content!: string;
  public wordCount!: number;
  public status!: 'planned' | 'in_progress' | 'first_draft' | 'revised' | 'final';
  public aiCritique?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Chapter.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    title: { type: DataTypes.STRING(255), allowNull: false },
    order: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },
    wordCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM('planned', 'in_progress', 'first_draft', 'revised', 'final'), allowNull: false, defaultValue: 'planned' },
    aiCritique: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'chapters', timestamps: true }
);

export default Chapter;
