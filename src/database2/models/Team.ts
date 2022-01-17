import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { TeamServer } from './TeamServer';
import { initUser, User } from './User';

interface TeamAttributes {
  id: number;
  name: string;
  textChannelSnowflake?: string;
}

type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'textChannelSnowflake'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  declare id: number;
  declare name: string;
  declare textChannelSnowflake?: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getTeamServer: BelongsToGetAssociationMixin<TeamServer>;
  // declare setTeamServer: BelongsToSetAssociationMixin<TeamServer, number>;
  // declare createTeamServer: BelongsToCreateAssociationMixin<TeamServer>;
  declare readonly teamServer?: TeamServer;

  // declare getUsers: HasManyGetAssociationsMixin<User>;
  // declare countUsers: HasManyCountAssociationsMixin;
  // declare hasUser: HasManyHasAssociationMixin<User, number>;
  // declare hasUsers: HasManyHasAssociationsMixin<User, number>;
  // declare setUsers: HasManySetAssociationsMixin<User, number>;
  // declare addUser: HasManyAddAssociationMixin<User, number>;
  // declare addUsers: HasManyAddAssociationsMixin<User, number>;
  // declare removeUser: HasManyRemoveAssociationMixin<User, number>;
  // declare removeUsers: HasManyRemoveAssociationsMixin<User, number>;
  // declare createUser: HasManyCreateAssociationMixin<User>;
  declare readonly users?: User[];
}

export function initTeam(sequelize: Sequelize) {
  Team.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      textChannelSnowflake: DataTypes.STRING,
    },
    {
      sequelize,
    },
  );

  Team.belongsTo(TeamServer);

  initUser(sequelize);
  Team.hasMany(User);
}
