import {
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { initTeamServer, TeamServer } from './TeamServer';
import { Category, initCategory } from './Category';
import { Challenge } from './Challenge';
import { Flag } from './Flag';
import { Team } from './Team';
import { User } from './User';

interface CtfAttributes {
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
  tosMessage: string;
}

type CtfCreationAttributes = Optional<
  CtfAttributes,
  | 'id'
  | 'startDate'
  | 'endDate'
  | 'adminRoleSnowflake'
  | 'participantRoleSnowflake'
  | 'announcementsChannelSnowflake'
  | 'scoreboardChannelSnowflake'
  | 'tosChannelSnowflake'
  | 'infoCategorySnowflake'
  | 'tosMessage'
>;

export class Ctf extends Model<CtfAttributes, CtfCreationAttributes> implements CtfAttributes {
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
  declare tosMessage: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getCategories: HasManyGetAssociationsMixin<Category>;
  // declare countCategories: HasManyCountAssociationsMixin;
  // declare hasCategory: HasManyHasAssociationMixin<Category, number>;
  // declare hasCategories: HasManyHasAssociationsMixin<Category, number>;
  // declare setCategories: HasManySetAssociationsMixin<Category, number>;
  // declare addCategory: HasManyAddAssociationMixin<Category, number>;
  // declare addCategories: HasManyAddAssociationsMixin<Category, number>;
  // declare removeCategory: HasManyRemoveAssociationMixin<Category, number>;
  // declare removeCategories: HasManyRemoveAssociationsMixin<Category, number>;
  declare createCategory: HasManyCreateAssociationMixin<Category>;
  declare readonly Categories?: Category[];

  declare getTeamServers: HasManyGetAssociationsMixin<TeamServer>;
  // declare countTeamServers: HasManyCountAssociationsMixin;
  // declare hasTeamServer: HasManyHasAssociationMixin<TeamServer, number>;
  // declare hasTeamServers: HasManyHasAssociationsMixin<TeamServer, number>;
  // declare setTeamServers: HasManySetAssociationsMixin<TeamServer, number>;
  // declare addTeamServer: HasManyAddAssociationMixin<TeamServer, number>;
  // declare addTeamServers: HasManyAddAssociationsMixin<TeamServer, number>;
  // declare removeTeamServer: HasManyRemoveAssociationMixin<TeamServer, number>;
  // declare removeTeamServers: HasManyRemoveAssociationsMixin<TeamServer, number>;
  declare createTeamServer: HasManyCreateAssociationMixin<TeamServer>;
  declare readonly TeamServers?: TeamServer[];

  // this query gets the team server with the least number of teams on it
  async getMostEmptyTeamServer(): Promise<TeamServer> {
    const teamServers = await this.getTeamServers({
      group: ['TeamServer.id'],
      order: [[Sequelize.fn('COUNT', Sequelize.col('Teams.*')), 'ASC']],
      // because sequelize is well and truly braindead, we can't limit this to the top result we care about
      // limit: 1,
      include: [
        {
          attributes: [],
          model: Team,
        },
      ],
    });
    if (teamServers.length === 0) throw new Error('no team servers found');
    return teamServers[0];
  }

  async hasUser(userSnowflake: string): Promise<boolean> {
    const teamServers = await this.getTeamServers({
      attributes: ['id'],
      include: [
        {
          model: Team,
          attributes: ['id'],
          required: true,
          include: [
            {
              model: User,
              attributes: ['id', 'userSnowflake'],
              required: true,
              where: {
                userSnowflake,
              },
            },
          ],
        },
      ],
    });
    return teamServers.length > 0;
  }

  // returns the flag that matches, or nothing
  async getFlag(flagText: string): Promise<Flag | undefined> {
    const categories = await this.getCategories({
      attributes: ['id'],
      include: {
        model: Challenge,
        attributes: ['id'],
        required: true,
        include: [
          {
            model: Flag,
            required: true,
            where: { flagText },
          },
        ],
      },
    });

    if (!categories || !categories[0].Challenges || !categories[0].Challenges[0].Flags) return;

    // otherwise, the flag matched something
    return categories[0].Challenges[0].Flags[0];
  }
}

export function initCtf(sequelize: Sequelize) {
  Ctf.init(
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
      tosMessage: {
        type: DataTypes.JSON,
        defaultValue: '[]',
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  initTeamServer(sequelize);
  Ctf.hasMany(TeamServer);

  initCategory(sequelize);
  Ctf.hasMany(Category);
  Ctf.hasMany(Challenge);
}
