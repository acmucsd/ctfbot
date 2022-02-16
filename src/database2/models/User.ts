import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Team } from './Team';
import { initInvite, Invite } from './Invite';

interface UserAttributes {
  id: number;
  userSnowflake: string;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'userSnowflake'>;

export class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: number;
  declare userSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getTeam: BelongsToGetAssociationMixin<Team>;
  // declare setTeam: BelongsToSetAssociationMixin<Team, number>;
  // declare createTeam: BelongsToCreateAssociationMixin<Team>;
  declare readonly Team?: Team;

  // declare getInvites: HasManyGetAssociationsMixin<Invite>;
  // declare countInvites: HasManyCountAssociationsMixin;
  // declare hasInvite: HasManyHasAssociationMixin<Invite, number>;
  // declare hasInvites: HasManyHasAssociationsMixin<Invite, number>;
  // declare setInvites: HasManySetAssociationsMixin<Invite, number>;
  // declare addInvite: HasManyAddAssociationMixin<Invite, number>;
  // declare addInvites: HasManyAddAssociationsMixin<Invite, number>;
  // declare removeInvite: HasManyRemoveAssociationMixin<Invite, number>;
  // declare removeInvites: HasManyRemoveAssociationsMixin<Invite, number>;
  // declare createInvite: HasManyCreateAssociationMixin<Invite>;
  // declare readonly invites?: Invite[];
}

export function initUser(sequelize: Sequelize) {
  User.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      userSnowflake: DataTypes.STRING,
    },
    {
      sequelize,
    },
  );

  User.belongsTo(Team);

  initInvite(sequelize);
  User.hasMany(Invite);
}
