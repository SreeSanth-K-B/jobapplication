import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/mysql';

interface UserAttributes {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  googleRefreshToken?: string;
  gmailConnected: boolean;
  targetRoles?: string;
  preferredLocations?: string;
  salaryRange?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'gmailConnected'> {}

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public name!: string;
  public email!: string;
  public passwordHash!: string;
  public googleRefreshToken?: string;
  public gmailConnected!: boolean;
  public targetRoles?: string;
  public preferredLocations?: string;
  public salaryRange?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    passwordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    googleRefreshToken: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    gmailConnected: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    targetRoles: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    preferredLocations: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    salaryRange: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);
