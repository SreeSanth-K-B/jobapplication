import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/mysql';

interface GoalAttributes {
  id: string;
  userId: string;
  weeklyTarget: number;
  createdAt?: Date;
  updatedAt?: Date;
}

interface GoalCreationAttributes extends Optional<GoalAttributes, 'id'> {}

export class Goal extends Model<GoalAttributes, GoalCreationAttributes> implements GoalAttributes {
  public id!: string;
  public userId!: string;
  public weeklyTarget!: number;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Goal.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    weeklyTarget: {
      type: DataTypes.INTEGER,
      defaultValue: 10,
    },
  },
  {
    sequelize,
    tableName: 'goals',
    timestamps: true,
  }
);
