import {
  BelongsToGetAssociationMixin,
  BelongsToSetAssociationMixin,
  DataTypes,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { TeamServer } from './TeamServer';
import { Challenge } from './Challenge';

interface ChallengeChannelAttributes {
  id: number;
  channelSnowflake: string;
}

type ChallengeChannelCreationAttributes = Optional<ChallengeChannelAttributes, 'id' | 'channelSnowflake'>;

export class ChallengeChannel
  extends Model<ChallengeChannelAttributes, ChallengeChannelCreationAttributes>
  implements ChallengeChannelAttributes
{
  declare id: number;
  declare channelSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getTeamServer: BelongsToGetAssociationMixin<TeamServer>;
  declare setTeamServer: BelongsToSetAssociationMixin<TeamServer, number>;
  // declare createTeamServer: BelongsToCreateAssociationMixin<TeamServer>;
  declare readonly TeamServer?: TeamServer;

  declare getChallenge: BelongsToGetAssociationMixin<Challenge>;
  declare setChallenge: BelongsToSetAssociationMixin<Challenge, number>;
  // declare createChallenge: BelongsToCreateAssociationMixin<Challenge>;
  declare readonly Challenge?: Challenge;
}

export function initChallengeChannel(sequelize: Sequelize) {
  ChallengeChannel.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      channelSnowflake: DataTypes.STRING,
    },
    {
      sequelize,
    },
  );

  // ChallengeChannel.belongsTo(TeamServer, {
  //   onDelete: 'RESTRICT',
  //   foreignKey: {
  //     allowNull: false,
  //   },
  // });
  // TeamServer.hasMany(ChallengeChannel);
  //
  // ChallengeChannel.belongsTo(Challenge, {
  //   onDelete: 'RESTRICT',
  //   foreignKey: {
  //     allowNull: false,
  //   },
  // });
}
