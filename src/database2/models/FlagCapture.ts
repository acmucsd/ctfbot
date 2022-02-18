import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { Flag } from './Flag';
import { User } from './User';

interface FlagCaptureAttributes {
  id: number;
}

type FlagCaptureCreationAttributes = Optional<FlagCaptureAttributes, 'id'>;

export class FlagCapture
  extends Model<FlagCaptureAttributes, FlagCaptureCreationAttributes>
  implements FlagCaptureAttributes
{
  declare id: number;

  declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getUser: BelongsToGetAssociationMixin<User>;
  // declare setUser: BelongsToSetAssociationMixin<User, number>;
  // declare createUser: BelongsToCreateAssociationMixin<User>;
  declare readonly User?: User;

  // declare getFlag: BelongsToGetAssociationMixin<Flag>;
  // declare setFlag: BelongsToSetAssociationMixin<Flag, number>;
  // declare createFlag: BelongsToCreateAssociationMixin<Flag>;
  declare readonly Flag?: Flag;
}

export function initFlagCapture(sequelize: Sequelize) {
  FlagCapture.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    },
    {
      sequelize,
    },
  );

  FlagCapture.belongsTo(User, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  FlagCapture.belongsTo(Flag, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });
}
