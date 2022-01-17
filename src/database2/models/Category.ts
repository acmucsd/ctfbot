import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { CTF } from './CTF';
import { Challenge, initChallenge } from './Challenge';

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

  // declare getCTF: BelongsToGetAssociationMixin<CTF>;
  // declare setCTF: BelongsToSetAssociationMixin<CTF, number>;
  // declare createCTF: BelongsToCreateAssociationMixin<CTF>;
  declare readonly ctf?: CTF;

  // declare getChallenges: HasManyGetAssociationsMixin<Challenge>;
  // declare countChallenges: HasManyCountAssociationsMixin;
  // declare hasChallenge: HasManyHasAssociationMixin<Challenge, number>;
  // declare hasChallenges: HasManyHasAssociationsMixin<Challenge, number>;
  // declare setChallenges: HasManySetAssociationsMixin<Challenge, number>;
  // declare addChallenge: HasManyAddAssociationMixin<Challenge, number>;
  // declare addChallenges: HasManyAddAssociationsMixin<Challenge, number>;
  // declare removeChallenge: HasManyRemoveAssociationMixin<Challenge, number>;
  // declare removeChallenges: HasManyRemoveAssociationsMixin<Challenge, number>;
  // declare createChallenge: HasManyCreateAssociationMixin<Challenge>;
  // declare readonly challenges?: Challenge[];
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

  Category.belongsTo(CTF, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  initChallenge(sequelize);
  Category.hasMany(Challenge);
}
