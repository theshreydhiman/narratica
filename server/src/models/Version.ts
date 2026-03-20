import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface VersionAttributes {
  id: number;
  chapterId: number;
  content: string;
  wordCount: number;
}

interface VersionCreationAttributes extends Optional<VersionAttributes, 'id'> {}

class Version extends Model<VersionAttributes, VersionCreationAttributes> implements VersionAttributes {
  public id!: number;
  public chapterId!: number;
  public content!: string;
  public wordCount!: number;
  public readonly createdAt!: Date;
}

Version.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    chapterId: { type: DataTypes.INTEGER, allowNull: false },
    content: { type: DataTypes.TEXT('long'), allowNull: false },

    wordCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'versions', timestamps: true, updatedAt: false }
);

export default Version;
