import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Challenge } from './Challenge';
import { FlagCapture, initFlagCapture } from './FlagCapture';

interface FlagAttributes {
  id: number;
  flagText: string;
}

type FlagCreationAttributes = Optional<FlagAttributes, 'id'>;

export class Flag extends Model<FlagAttributes, FlagCreationAttributes> implements FlagAttributes {
  declare id: number;
  declare flagText: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getChallenge: BelongsToGetAssociationMixin<Challenge>;
  // declare setChallenge: BelongsToSetAssociationMixin<Challenge, number>;
  // declare createChallenge: BelongsToCreateAssociationMixin<Challenge>;
  declare readonly challenge?: Challenge;

  // declare getFlagCaptures: HasManyGetAssociationsMixin<FlagCapture>;
  // declare countFlagCaptures: HasManyCountAssociationsMixin;
  // declare hasFlagCapture: HasManyHasAssociationMixin<FlagCapture, number>;
  // declare hasFlagCaptures: HasManyHasAssociationsMixin<FlagCapture, number>;
  // declare setFlagCaptures: HasManySetAssociationsMixin<FlagCapture, number>;
  // declare addFlagCapture: HasManyAddAssociationMixin<FlagCapture, number>;
  // declare addFlagCaptures: HasManyAddAssociationsMixin<FlagCapture, number>;
  // declare removeFlagCapture: HasManyRemoveAssociationMixin<FlagCapture, number>;
  // declare removeFlagCaptures: HasManyRemoveAssociationsMixin<FlagCapture, number>;
  // declare createFlagCapture: HasManyCreateAssociationMixin<FlagCapture>;
  // declare readonly flagCaptures?: FlagCapture[];
}

export function initFlag(sequelize: Sequelize) {
  Flag.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      flagText: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  Flag.belongsTo(Challenge, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  initFlagCapture(sequelize);
  Flag.hasMany(FlagCapture);
}
