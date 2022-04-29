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

  // TODO: handle grouping, min/max, and category filters
  async getTeamData(): Promise<{ name: string; lastSubmission: Date; points: number }[]> {
    const ctf = await this.getCtf({ attributes: ['id'] });
    return await ctf.getTeamData();
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
