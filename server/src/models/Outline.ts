import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface OutlineAttributes {
  id: number;
  projectId: number;
  structureType: 'three_act' | 'hero_journey' | 'save_the_cat' | 'snowflake' | 'custom';
  beats: object[];
}

interface OutlineCreationAttributes extends Optional<OutlineAttributes, 'id' | 'beats'> {}

class Outline extends Model<OutlineAttributes, OutlineCreationAttributes> implements OutlineAttributes {
  public id!: number;
  public projectId!: number;
  public structureType!: 'three_act' | 'hero_journey' | 'save_the_cat' | 'snowflake' | 'custom';
  public beats!: object[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Outline.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    projectId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    structureType: { type: DataTypes.ENUM('three_act', 'hero_journey', 'save_the_cat', 'snowflake', 'custom'), allowNull: false, defaultValue: 'three_act' },
    beats: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  },
  { sequelize, tableName: 'outlines', timestamps: true }
);

export default Outline;
