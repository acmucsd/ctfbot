import {
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Challenge } from './Challenge';
import { User } from './User';

interface FlagAttributes {
  id: number;
  flagText: string;
  pointValue: number;
}

type FlagCreationAttributes = Optional<FlagAttributes, 'id'>;

export class Flag extends Model<FlagAttributes, FlagCreationAttributes> implements FlagAttributes {
  declare id: number;
  declare flagText: string;
  declare pointValue: number;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getChallenge: BelongsToGetAssociationMixin<Challenge>;
  // declare setChallenge: BelongsToSetAssociationMixin<Challenge, number>;
  // declare createChallenge: BelongsToCreateAssociationMixin<Challenge>;
  declare readonly challenge?: Challenge;

  // declare getUsers: HasManyGetAssociationsMixin<User>;
  declare countUsers: HasManyCountAssociationsMixin;
  // declare hasUser: HasManyHasAssociationMixin<User, number>;
  // declare hasUsers: HasManyHasAssociationsMixin<User, number>;
  // declare setUsers: HasManySetAssociationsMixin<User, number>;
  declare addUser: HasManyAddAssociationMixin<User, number>;
  // declare addUsers: HasManyAddAssociationsMixin<User, number>;
  // declare removeUser: HasManyRemoveAssociationMixin<User, number>;
  // declare removeUsers: HasManyRemoveAssociationsMixin<User, number>;
  // declare createUser: HasManyCreateAssociationMixin<User>;
  declare readonly Users?: User[];
}

export function initFlag(sequelize: Sequelize) {
  Flag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      flagText: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      pointValue: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  Flag.belongsTo(Challenge, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  // many to many with users
  Flag.belongsToMany(User, { through: 'flag_captures' });
  User.belongsToMany(Flag, { through: 'flag_captures' });
}
