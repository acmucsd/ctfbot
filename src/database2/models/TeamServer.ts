import { BelongsToGetAssociationMixin, DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { CTF } from './CTF';
import { initTeam, Team } from './Team';

interface TeamServerAttributes {
  id: number;
  name: string;
  guildSnowflake: string;
  infoChannelSnowflake: string;
  inviteChannelSnowflake: string;
  inviteRoleSnowflake: string;
  adminRoleSnowflake: string;
  participantRoleSnowflake: string;
  serverInvite: string;
}

type TeamServerCreationAttributes = Optional<
  TeamServerAttributes,
  | 'id'
  | 'name'
  | 'infoChannelSnowflake'
  | 'inviteChannelSnowflake'
  | 'inviteRoleSnowflake'
  | 'adminRoleSnowflake'
  | 'participantRoleSnowflake'
  | 'serverInvite'
>;

export class TeamServer
  extends Model<TeamServerAttributes, TeamServerCreationAttributes>
  implements TeamServerAttributes
{
  declare id: number;
  declare name: string;
  declare guildSnowflake: string;
  declare infoChannelSnowflake: string;
  declare inviteChannelSnowflake: string;
  declare inviteRoleSnowflake: string;
  declare adminRoleSnowflake: string;
  declare participantRoleSnowflake: string;
  declare serverInvite: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getCTF: BelongsToGetAssociationMixin<CTF>;
  // declare setCTF: BelongsToSetAssociationMixin<CTF, number>;
  // declare createCTF: BelongsToCreateAssociationMixin<CTF>;
  declare readonly ctf?: CTF;

  // declare getTeams: HasManyGetAssociationsMixin<Team>;
  // declare countTeams: HasManyCountAssociationsMixin;
  // declare hasTeam: HasManyHasAssociationMixin<Team, number>;
  // declare hasTeams: HasManyHasAssociationsMixin<Team, number>;
  // declare setTeams: HasManySetAssociationsMixin<Team, number>;
  // declare addTeam: HasManyAddAssociationMixin<Team, number>;
  // declare addTeams: HasManyAddAssociationsMixin<Team, number>;
  // declare removeTeam: HasManyRemoveAssociationMixin<Team, number>;
  // declare removeTeams: HasManyRemoveAssociationsMixin<Team, number>;
  // declare createTeam: HasManyCreateAssociationMixin<Team>;
  declare readonly teams?: Team[];
}

export function initTeamServer(sequelize: Sequelize) {
  TeamServer.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      guildSnowflake: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      infoChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      inviteChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      inviteRoleSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      adminRoleSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      participantRoleSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      serverInvite: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  TeamServer.belongsTo(CTF, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  initTeam(sequelize);
  TeamServer.hasMany(Team);
}
