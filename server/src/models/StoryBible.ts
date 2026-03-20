import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface StoryBibleAttributes {
  id: number;
  projectId: number;
  premise: string;
  themes: string[];
  setting: string;
  timePeriod: string;
  worldRules?: string;
}

interface StoryBibleCreationAttributes extends Optional<StoryBibleAttributes, 'id' | 'worldRules'> {}

class StoryBible extends Model<StoryBibleAttributes, StoryBibleCreationAttributes> implements StoryBibleAttributes {
  public id!: number;
  public projectId!: number;
  public premise!: string;
  public themes!: string[];
  public setting!: string;
  public timePeriod!: string;
  public worldRules?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

StoryBible.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    premise: { type: DataTypes.TEXT, allowNull: false },
    themes: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
    setting: { type: DataTypes.TEXT, allowNull: false },
    timePeriod: { type: DataTypes.STRING(255), allowNull: false },
    worldRules: { type: DataTypes.TEXT, allowNull: true },
  },
  { sequelize, tableName: 'story_bibles', timestamps: true }
);

export default StoryBible;
