import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Ctf } from './Ctf';
import { Category } from './Category';

interface ScoreboardAttributes {
  id: number;
  name: string;
  minTeamSize?: number;
  maxTeamSize?: number;
  group: string;
}

type ScoreboardCreationAttributes = Optional<ScoreboardAttributes, 'id'>;

export class Scoreboard
  extends Model<ScoreboardAttributes, ScoreboardCreationAttributes>
  implements ScoreboardAttributes
{
  declare id: number;
  declare name: string;
  declare minTeamSize?: number;
  declare maxTeamSize?: number;
  declare group: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getCtf: BelongsToGetAssociationMixin<Ctf>;
  // declare setCtf: BelongsToSetAssociationMixin<Ctf, number>;
  // declare createCtf: BelongsToCreateAssociationMixin<Ctf>;
  // declare readonly Ctf?: Ctf;

  // declare getCategory: BelongsToGetAssociationMixin<Category>;
  // declare setCategory: BelongsToSetAssociationMixin<Category, number>;
  // declare createCategory: BelongsToCreateAssociationMixin<Category>;
  // declare readonly Category?: Category;
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
      allowNull: false,
    },
  });
}
