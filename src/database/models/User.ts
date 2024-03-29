import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCountAssociationsMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  HasManyRemoveAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Team } from './Team';
import { initInvite, Invite } from './Invite';
import { Flag } from './Flag';

interface UserAttributes {
  id: number;
  userSnowflake: string;
}

type UserCreationAttributes = Optional<UserAttributes, 'id'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare userSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getTeam: BelongsToGetAssociationMixin<Team>;
  declare setTeam: BelongsToSetAssociationMixin<Team, number>;
  // declare createTeam: BelongsToCreateAssociationMixin<Team>;
  declare readonly Team?: Team;

  // declare getInvites: HasManyGetAssociationsMixin<Invite>;
  declare countInvites: HasManyCountAssociationsMixin;
  // declare hasInvite: HasManyHasAssociationMixin<Invite, number>;
  // declare hasInvites: HasManyHasAssociationsMixin<Invite, number>;
  // declare setInvites: HasManySetAssociationsMixin<Invite, number>;
  // declare addInvite: HasManyAddAssociationMixin<Invite, number>;
  // declare addInvites: HasManyAddAssociationsMixin<Invite, number>;
  // declare removeInvite: HasManyRemoveAssociationMixin<Invite, number>;
  // declare removeInvites: HasManyRemoveAssociationsMixin<Invite, number>;
  // declare createInvite: HasManyCreateAssociationMixin<Invite>;
  // declare readonly Invites?: Invite[];

  declare getFlags: HasManyGetAssociationsMixin<Flag>;
  // declare countFlags: HasManyCountAssociationsMixin;
  // declare hasFlag: HasManyHasAssociationMixin<Flag, number>;
  // declare hasFlags: HasManyHasAssociationsMixin<Flag, number>;
  // declare setFlags: HasManySetAssociationsMixin<Flag, number>;
  // declare addFlag: HasManyAddAssociationMixin<Flag, number>;
  // declare addFlags: HasManyAddAssociationsMixin<Flag, number>;
  // declare removeFlag: HasManyRemoveAssociationMixin<Flag, number>;
  declare removeFlags: HasManyRemoveAssociationsMixin<Flag, number>;
  // declare createFlag: HasManyCreateAssociationMixin<Flag>;
  declare readonly Flags?: Flag[];
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userSnowflake: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  User.belongsTo(Team, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });

  initInvite(sequelize);
  User.hasMany(Invite);
}
