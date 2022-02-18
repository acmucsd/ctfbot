import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { TeamServer } from './TeamServer';
import { Category } from './Category';

interface CategoryChannelAttributes {
  id: number;
  channelSnowflake: string;
}

type CategoryChannelCreationAttributes = Optional<CategoryChannelAttributes, 'id' | 'channelSnowflake'>;

export class CategoryChannel
  extends Model<CategoryChannelAttributes, CategoryChannelCreationAttributes>
  implements CategoryChannelAttributes
{
  declare id: number;
  declare channelSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getTeamServer: BelongsToGetAssociationMixin<TeamServer>;
  declare setTeamServer: BelongsToSetAssociationMixin<TeamServer, number>;
  // declare createTeamServer: BelongsToCreateAssociationMixin<TeamServer>;
  declare readonly TeamServer?: TeamServer;

  declare getCategory: BelongsToGetAssociationMixin<Category>;
  declare setCategory: BelongsToSetAssociationMixin<Category, number>;
  // declare createCategory: BelongsToCreateAssociationMixin<Category>;
  declare readonly Category?: Category;
}

export function initCategoryChannel(sequelize: Sequelize) {
  CategoryChannel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
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

  CategoryChannel.belongsTo(TeamServer, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });
  TeamServer.hasMany(CategoryChannel);

  CategoryChannel.belongsTo(Category, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });
}
