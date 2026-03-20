import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface AchievementAttributes {
  id: number;
  userId: number;
  type: 'streak' | 'word_count' | 'chapter' | 'project' | 'special';
  milestone: string;
  description: string;
  unlockedAt: Date;
}

interface AchievementCreationAttributes extends Optional<AchievementAttributes, 'id' | 'unlockedAt'> {}

class Achievement extends Model<AchievementAttributes, AchievementCreationAttributes> implements AchievementAttributes {
  public id!: number;
  public userId!: number;
  public type!: 'streak' | 'word_count' | 'chapter' | 'project' | 'special';
  public milestone!: string;
  public description!: string;
  public unlockedAt!: Date;
}

Achievement.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.ENUM('streak', 'word_count', 'chapter', 'project', 'special'), allowNull: false },
    milestone: { type: DataTypes.STRING(255), allowNull: false },
    description: { type: DataTypes.STRING(500), allowNull: false },
    unlockedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'achievements', timestamps: false }
);

export default Achievement;
