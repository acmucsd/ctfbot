import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { initTeamServer, TeamServer } from './TeamServer';
import { Category, initCategory } from './Category';

interface CTFAttributes {
  id: number;
  name: string;
  guildSnowflake: string;
  // when startDate is null, the CTF is "unpublished"
  startDate?: Date;
  // when endDate is null, submission is allowed indefinitely
  endDate?: Date;
  // discord stuff to be defined later
  adminRoleSnowflake: string;
  participantRoleSnowflake: string;
  announcementsChannelSnowflake: string;
  scoreboardChannelSnowflake: string;
  tosChannelSnowflake: string;
  infoCategorySnowflake: string;
}

type CTFCreationAttributes = Optional<
  CTFAttributes,
  | 'id'
  | 'startDate'
  | 'endDate'
  | 'adminRoleSnowflake'
  | 'participantRoleSnowflake'
  | 'announcementsChannelSnowflake'
  | 'scoreboardChannelSnowflake'
  | 'tosChannelSnowflake'
  | 'infoCategorySnowflake'
>;

export class CTF extends Model<CTFAttributes, CTFCreationAttributes> implements CTFAttributes {
  declare id: number;
  declare name: string;
  declare guildSnowflake: string;
  declare startDate?: Date;
  declare endDate?: Date;
  declare adminRoleSnowflake: string;
  declare participantRoleSnowflake: string;
  declare announcementsChannelSnowflake: string;
  declare scoreboardChannelSnowflake: string;
  declare tosChannelSnowflake: string;
  declare infoCategorySnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getCategories: HasManyGetAssociationsMixin<Category>;
  // declare countCategories: HasManyCountAssociationsMixin;
  // declare hasCategory: HasManyHasAssociationMixin<Category, number>;
  // declare hasCategories: HasManyHasAssociationsMixin<Category, number>;
  // declare setCategories: HasManySetAssociationsMixin<Category, number>;
  // declare addCategory: HasManyAddAssociationMixin<Category, number>;
  // declare addCategories: HasManyAddAssociationsMixin<Category, number>;
  // declare removeCategory: HasManyRemoveAssociationMixin<Category, number>;
  // declare removeCategories: HasManyRemoveAssociationsMixin<Category, number>;
  // declare createCategory: HasManyCreateAssociationMixin<Category>;
  // declare readonly Categories?: Category[];

  // declare getTeamServers: HasManyGetAssociationsMixin<TeamServer>;
  // declare countTeamServers: HasManyCountAssociationsMixin;
  // declare hasTeamServer: HasManyHasAssociationMixin<TeamServer, number>;
  // declare hasTeamServers: HasManyHasAssociationsMixin<TeamServer, number>;
  // declare setTeamServers: HasManySetAssociationsMixin<TeamServer, number>;
  // declare addTeamServer: HasManyAddAssociationMixin<TeamServer, number>;
  // declare addTeamServers: HasManyAddAssociationsMixin<TeamServer, number>;
  // declare removeTeamServer: HasManyRemoveAssociationMixin<TeamServer, number>;
  // declare removeTeamServers: HasManyRemoveAssociationsMixin<TeamServer, number>;
  // declare createTeamServer: HasManyCreateAssociationMixin<TeamServer>;
  // declare readonly teamServers?: TeamServer[];
}

export function initCTF(sequelize: Sequelize) {
  CTF.init(
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
      guildSnowflake: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      startDate: DataTypes.DATE,
      endDate: DataTypes.DATE,
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
      announcementsChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      scoreboardChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      tosChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      infoCategorySnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  initTeamServer(sequelize);
  CTF.hasMany(TeamServer);

  initCategory(sequelize);
  CTF.hasMany(Category);
}
