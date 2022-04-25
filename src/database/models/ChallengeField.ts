import { BelongsToGetAssociationMixin, DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Challenge } from './Challenge';

interface ChallengeFieldAttributes {
  id: number;
  title: string;
  content: string;
}

type ChallengeFieldCreationAttributes = Optional<ChallengeFieldAttributes, 'id'>;

export class ChallengeField
  extends Model<ChallengeFieldAttributes, ChallengeFieldCreationAttributes>
  implements ChallengeFieldAttributes
{
  declare id: number;
  declare title: string;
  declare content: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getChallenge: BelongsToGetAssociationMixin<Challenge>;
  // declare setChallenge: BelongsToSetAssociationMixin<Challenge, number>;
  // declare createChallenge: BelongsToCreateAssociationMixin<Challenge>;
  // declare readonly challenge?: Challenge;
}

export function initChallengeField(sequelize: Sequelize) {
  ChallengeField.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  ChallengeField.belongsTo(Challenge, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });
}
