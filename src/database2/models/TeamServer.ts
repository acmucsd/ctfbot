import {
  BelongsToGetAssociationMixin,
  BelongsToManyAddAssociationMixin,
  BelongsToManyHasAssociationMixin,
  DataTypes,
  HasManyAddAssociationMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyHasAssociationMixin,
  HasManyHasAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { CTF } from './CTF';
import { initTeam, Team } from './Team';
import { Category } from './Category';
import { CategoryChannel } from './CategoryChannel';
import { ChallengeChannel } from './ChallengeChannel';

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
  declare readonly CTF?: CTF;

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
  declare readonly Teams?: Team[];

  declare getCategoryChannels: HasManyGetAssociationsMixin<CategoryChannel>;
  // declare countCategoryChannels: HasManyCountAssociationsMixin;
  //declare hasCategoryChannel: HasManyHasAssociationMixin<CategoryChannel, number>;
  // declare hasCategoryChannels: HasManyHasAssociationsMixin<CategoryChannel, number>;
  // declare setCategoryChannels: HasManySetAssociationsMixin<CategoryChannel, number>;
  // declare addCategoryChannel: HasManyAddAssociationMixin<CategoryChannel, number>;
  // declare addCategoryChannels: HasManyAddAssociationsMixin<CategoryChannel, number>;
  // declare removeCategoryChannel: HasManyRemoveAssociationMixin<CategoryChannel, number>;
  // declare removeCategoryChannels: HasManyRemoveAssociationsMixin<CategoryChannel, number>;
  // declare createCategoryChannel: HasManyCreateAssociationMixin<CategoryChannel>;
  declare readonly CategoryChannels?: CategoryChannel[];

  declare getChallengeChannels: HasManyGetAssociationsMixin<ChallengeChannel>;
  // declare countChallengeChannels: HasManyCountAssociationsMixin;
  // declare hasChallengeChannel: HasManyHasAssociationMixin<ChallengeChannel, number>;
  // declare hasChallengeChannels: HasManyHasAssociationsMixin<ChallengeChannel, number>;
  // declare setChallengeChannels: HasManySetAssociationsMixin<ChallengeChannel, number>;
  // declare addChallengeChannel: HasManyAddAssociationMixin<ChallengeChannel, number>;
  // declare addChallengeChannels: HasManyAddAssociationsMixin<ChallengeChannel, number>;
  // declare removeChallengeChannel: HasManyRemoveAssociationMixin<ChallengeChannel, number>;
  // declare removeChallengeChannels: HasManyRemoveAssociationsMixin<ChallengeChannel, number>;
  // declare createChallengeChannel: HasManyCreateAssociationMixin<ChallengeChannel>;
  declare readonly ChallengeChannels?: ChallengeChannel[];
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
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });

  initTeam(sequelize);
  TeamServer.hasMany(Team);
}
