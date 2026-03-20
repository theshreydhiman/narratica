import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface CharacterAttributes {
  id: number;
  storyBibleId: number;
  name: string;
  role: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  age?: string;
  description?: string;
  backstory?: string;
  personality?: string;
  arc?: string;
  relationships: object[];
}

interface CharacterCreationAttributes extends Optional<CharacterAttributes, 'id' | 'age' | 'description' | 'backstory' | 'personality' | 'arc' | 'relationships'> {}

class Character extends Model<CharacterAttributes, CharacterCreationAttributes> implements CharacterAttributes {
  public id!: number;
  public storyBibleId!: number;
  public name!: string;
  public role!: 'protagonist' | 'antagonist' | 'supporting' | 'minor';
  public age?: string;
  public description?: string;
  public backstory?: string;
  public personality?: string;
  public arc?: string;
  public relationships!: object[];
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Character.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    storyBibleId: { type: DataTypes.INTEGER, allowNull: false },
    name: { type: DataTypes.STRING(255), allowNull: false },
    role: { type: DataTypes.ENUM('protagonist', 'antagonist', 'supporting', 'minor'), allowNull: false },
    age: { type: DataTypes.STRING(50), allowNull: true },
    description: { type: DataTypes.TEXT, allowNull: true },
    backstory: { type: DataTypes.TEXT, allowNull: true },
    personality: { type: DataTypes.TEXT, allowNull: true },
    arc: { type: DataTypes.TEXT, allowNull: true },
    relationships: { type: DataTypes.JSON, allowNull: false, defaultValue: [] },
  },
  { sequelize, tableName: 'characters', timestamps: true }
);

export default Character;
