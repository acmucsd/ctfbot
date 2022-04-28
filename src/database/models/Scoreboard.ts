import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Ctf } from './Ctf';
import { Category } from './Category';
import { Team } from './Team';
import { User } from './User';
import { Flag } from './Flag';

interface ScoreboardAttributes {
  id: number;
  name: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  group: string;
  channelSnowflake: string;
}

type ScoreboardCreationAttributes = Optional<ScoreboardAttributes, 'id' | 'channelSnowflake'>;

export class Scoreboard
  extends Model<ScoreboardAttributes, ScoreboardCreationAttributes>
  implements ScoreboardAttributes
{
  declare id: number;
  declare name: string;
  declare minTeamSize?: number;
  declare maxTeamSize?: number;
  declare group: string;
  declare channelSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getCtf: BelongsToGetAssociationMixin<Ctf>;
  declare setCtf: BelongsToSetAssociationMixin<Ctf, number>;
  // declare createCtf: BelongsToCreateAssociationMixin<Ctf>;
  // declare readonly Ctf?: Ctf;

  // declare getCategory: BelongsToGetAssociationMixin<Category>;
  declare setCategory: BelongsToSetAssociationMixin<Category, number>;
  // declare createCategory: BelongsToCreateAssociationMixin<Category>;
  // declare readonly Category?: Category;

  // insane ugly raw-mode query that returns an ordered list of team names, last submissions, and total points
  async getTeamData(): Promise<{ name: string; lastSubmission: Date; points: number }[]> {
    // there are some truly idiotic reasons why we have to build this query this way
    // just don't ask, I'm a broken man at this point
    const ctf = await this.getCtf({ attributes: ['id'] });
    return (await ctf.getTeamServers({
      attributes: [
        [Sequelize.col('Teams.name'), 'name'],
        [Sequelize.fn('sum', Sequelize.col('Teams.Users.Flags.point_value')), 'points'],
        [Sequelize.fn('max', Sequelize.col('Teams.Users.Flags.flag_captures.created_at')), 'lastSubmission'],
      ],
      raw: true,
      // we want to flatten this along teams
      group: ['Teams.id', 'Teams.name'],
      // order first by points, then by who got that number of points FIRST
      order: [
        [Sequelize.col('points'), 'DESC'],
        [Sequelize.col('lastSubmission'), 'ASC'],
      ],
      include: [
        {
          model: Team,
          attributes: ['id'],
          required: true,
          include: [
            {
              model: User,
              attributes: [],
              required: true,
              include: [
                {
                  model: Flag,
                  required: true,
                  attributes: [],
                  through: {
                    attributes: [],
                  },
                },
              ],
            },
          ],
        },
      ],
      // due to using custom attributes in aggregations, we gotta basically just override the type signature of this object
      // hope you don't have any bugs!
    })) as unknown as {
      name: string;
      lastSubmission: Date;
      points: number;
    }[];
  }
}

export function initScoreboard(sequelize: Sequelize) {
  Scoreboard.init(
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
      minTeamSize: {
        type: DataTypes.INTEGER,
      },
      maxTeamSize: {
        type: DataTypes.INTEGER,
      },
      group: {
        type: DataTypes.ENUM('PLAYERS', 'TEAMS'),
        defaultValue: 'TEAMS',
        allowNull: false,
      },
      channelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  Scoreboard.belongsTo(Ctf, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  Scoreboard.belongsTo(Category, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: true,
    },
  });
}
