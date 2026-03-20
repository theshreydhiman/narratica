import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

interface UserAttributes {
  id: number;
  email: string;
  name: string;
  password?: string;
  googleId?: string;
  avatarUrl?: string;
  skillLevel: 'beginner' | 'intermediate' | 'experienced';
  onboardingComplete: boolean;
  streakCount: number;
  lastWritingDate?: Date;
  totalWords: number;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'password' | 'googleId' | 'avatarUrl' | 'lastWritingDate'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public email!: string;
  public name!: string;
  public password?: string;
  public googleId?: string;
  public avatarUrl?: string;
  public skillLevel!: 'beginner' | 'intermediate' | 'experienced';
  public onboardingComplete!: boolean;
  public streakCount!: number;
  public lastWritingDate?: Date;
  public totalWords!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(255), allowNull: false },
    password: { type: DataTypes.STRING(255), allowNull: true },
    googleId: { type: DataTypes.STRING(255), allowNull: true, unique: true },
    avatarUrl: { type: DataTypes.STRING(500), allowNull: true },
    skillLevel: { type: DataTypes.ENUM('beginner', 'intermediate', 'experienced'), allowNull: false, defaultValue: 'beginner' },
    onboardingComplete: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    streakCount: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    lastWritingDate: { type: DataTypes.DATEONLY, allowNull: true },
    totalWords: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { sequelize, tableName: 'users', timestamps: true }
);

export default User;
