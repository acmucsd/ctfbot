import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { Category } from './Category';
import { Flag, initFlag } from './Flag';
import { ChallengeChannel, initChallengeChannel } from './ChallengeChannel';

export interface ChallengeAttributes {
  id: number;
  name: string;
  author: string;
  prompt: string;
  difficulty: string;
  publishTime?: Date;
}

type ChallengeCreationAttributes = Optional<
  ChallengeAttributes,
  'id' | 'author' | 'prompt' | 'difficulty' | 'publishTime'
>;

export class Challenge extends Model<ChallengeAttributes, ChallengeCreationAttributes> implements ChallengeAttributes {
  declare id: number;
  declare name: string;
  declare author: string;
  declare prompt: string;
  declare difficulty: string;
  declare publishTime?: Date;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getCategory: BelongsToGetAssociationMixin<Category>;
  declare setCategory: BelongsToSetAssociationMixin<Category, number>;
  // declare createCategory: BelongsToCreateAssociationMixin<Category>;
  declare readonly Category?: Category;

  declare getChallengeChannels: HasManyGetAssociationsMixin<ChallengeChannel>;
  // declare countChallengeChannels: HasManyCountAssociationsMixin;
  // declare hasChallengeChannel: HasManyHasAssociationMixin<ChallengeChannel, number>;
  // declare hasChallengeChannels: HasManyHasAssociationsMixin<ChallengeChannel, number>;
  // declare setChallengeChannels: HasManySetAssociationsMixin<ChallengeChannel, number>;
  // declare addChallengeChannel: HasManyAddAssociationMixin<ChallengeChannel, number>;
  // declare addChallengeChannels: HasManyAddAssociationsMixin<ChallengeChannel, number>;
  // declare removeChallengeChannel: HasManyRemoveAssociationMixin<ChallengeChannel, number>;
  // declare removeChallengeChannels: HasManyRemoveAssociationsMixin<ChallengeChannel, number>;
  declare createChallengeChannel: HasManyCreateAssociationMixin<ChallengeChannel>;
  // declare readonly challengeChannels?: ChallengeChannel[];

  declare getFlags: HasManyGetAssociationsMixin<Flag>;
  // declare countFlags: HasManyCountAssociationsMixin;
  // declare hasFlag: HasManyHasAssociationMixin<Flag, number>;
  // declare hasFlags: HasManyHasAssociationsMixin<Flag, number>;
  // declare setFlags: HasManySetAssociationsMixin<Flag, number>;
  // declare addFlag: HasManyAddAssociationMixin<Flag, number>;
  // declare addFlags: HasManyAddAssociationsMixin<Flag, number>;
  // declare removeFlag: HasManyRemoveAssociationMixin<Flag, number>;
  // declare removeFlags: HasManyRemoveAssociationsMixin<Flag, number>;
  declare createFlag: HasManyCreateAssociationMixin<Flag>;
  declare readonly Flags?: Flag[];
}

export function initChallenge(sequelize: Sequelize) {
  Challenge.init(
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
      author: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      prompt: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
      difficulty: {
        type: DataTypes.STRING,
        defaultValue: 'EASY',
        allowNull: false,
      },
      publishTime: DataTypes.DATE,
    },
    {
      sequelize,
    },
  );

  Challenge.belongsTo(Category, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });

  initChallengeChannel(sequelize);
  Challenge.hasMany(ChallengeChannel);

  initFlag(sequelize);
  Challenge.hasMany(Flag);
}
