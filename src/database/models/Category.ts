import {
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Ctf } from './Ctf';
import { Challenge, initChallenge } from './Challenge';
import { CategoryChannel, initCategoryChannel } from './CategoryChannel';

interface CategoryAttributes {
  id: number;
  name: string;
}

type CategoryCreationAttributes = Optional<CategoryAttributes, 'id'>;

export class Category extends Model<CategoryAttributes, CategoryCreationAttributes> implements CategoryAttributes {
  declare id: number;
  declare name: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getCtf: BelongsToGetAssociationMixin<Ctf>;
  // declare setCtf: BelongsToSetAssociationMixin<Ctf, number>;
  // declare createCtf: BelongsToCreateAssociationMixin<Ctf>;
  declare readonly Ctf?: Ctf;

  declare getCategoryChannels: HasManyGetAssociationsMixin<CategoryChannel>;
  // declare countCategoryChannels: HasManyCountAssociationsMixin;
  // declare hasCategoryChannel: HasManyHasAssociationMixin<CategoryChannel, number>;
  // declare hasCategoryChannels: HasManyHasAssociationsMixin<CategoryChannel, number>;
  // declare setCategoryChannels: HasManySetAssociationsMixin<CategoryChannel, number>;
  // declare addCategoryChannel: HasManyAddAssociationMixin<CategoryChannel, number>;
  // declare addCategoryChannels: HasManyAddAssociationsMixin<CategoryChannel, number>;
  // declare removeCategoryChannel: HasManyRemoveAssociationMixin<CategoryChannel, number>;
  // declare removeCategoryChannels: HasManyRemoveAssociationsMixin<CategoryChannel, number>;
  declare createCategoryChannel: HasManyCreateAssociationMixin<CategoryChannel>;
  declare readonly CategoryChannels?: CategoryChannel[];

  declare getChallenges: HasManyGetAssociationsMixin<Challenge>;
  // declare countChallenges: HasManyCountAssociationsMixin;
  // declare hasChallenge: HasManyHasAssociationMixin<Challenge, number>;
  // declare hasChallenges: HasManyHasAssociationsMixin<Challenge, number>;
  // declare setChallenges: HasManySetAssociationsMixin<Challenge, number>;
  // declare addChallenge: HasManyAddAssociationMixin<Challenge, number>;
  // declare addChallenges: HasManyAddAssociationsMixin<Challenge, number>;
  // declare removeChallenge: HasManyRemoveAssociationMixin<Challenge, number>;
  // declare removeChallenges: HasManyRemoveAssociationsMixin<Challenge, number>;
  declare createChallenge: HasManyCreateAssociationMixin<Challenge>;
  declare readonly Challenges?: Challenge[];
}

export function initCategory(sequelize: Sequelize) {
  Category.init(
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
    },
    {
      sequelize,
    },
  );

  Category.belongsTo(Ctf, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });

  initCategoryChannel(sequelize);
  Category.hasMany(CategoryChannel);

  initChallenge(sequelize);
  Category.hasMany(Challenge);
}
