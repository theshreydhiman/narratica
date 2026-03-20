import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface WritingSessionAttributes {
  id: number;
  userId: number;
  projectId: number;
  startedAt: Date;
  endedAt?: Date;
  wordsWritten: number;
  aiInteractions: number;
}

interface WritingSessionCreationAttributes extends Optional<WritingSessionAttributes, 'id' | 'endedAt' | 'wordsWritten' | 'aiInteractions'> {}

class WritingSession extends Model<WritingSessionAttributes, WritingSessionCreationAttributes> implements WritingSessionAttributes {
  public id!: number;
  public userId!: number;
  public projectId!: number;
  public startedAt!: Date;
  public endedAt?: Date;
  public wordsWritten!: number;
  public aiInteractions!: number;
}

WritingSession.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    projectId: { type: DataTypes.INTEGER, allowNull: false },
    startedAt: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
    endedAt: { type: DataTypes.DATE, allowNull: true },
    wordsWritten: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    aiInteractions: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'writing_sessions', timestamps: false }
);

export default WritingSession;
