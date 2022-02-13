import { BelongsToGetAssociationMixin, DataTypes, Model, Optional, Sequelize } from "sequelize";
import { TeamServer } from './TeamServer';
import { Challenge } from './Challenge';

interface ChallengeChannelAttributes {
  id: number;
  channelSnowflake: string;
  teamServerId: number;
}

type ChallengeChannelCreationAttributes = Optional<ChallengeChannelAttributes, 'id' | 'channelSnowflake'>;

export class ChallengeChannel
  extends Model<ChallengeChannelAttributes, ChallengeChannelCreationAttributes>
  implements ChallengeChannelAttributes
{
  declare id: number;
  declare channelSnowflake: string;
  declare teamServerId: number;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getTeamServer: BelongsToGetAssociationMixin<TeamServer>;
  // declare setTeamServer: BelongsToSetAssociationMixin<TeamServer, number>;
  // declare createTeamServer: BelongsToCreateAssociationMixin<TeamServer>;
  declare readonly TeamServer?: TeamServer;

  declare getChallenge: BelongsToGetAssociationMixin<Challenge>;
  // declare setChallenge: BelongsToSetAssociationMixin<Challenge, number>;
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
      teamServerId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      sequelize,
    },
  );

  ChallengeChannel.belongsTo(TeamServer, {
    onDelete: 'RESTRICT',
    foreignKey: {
      name: 'teamServerId',
      allowNull: false,
    },
  });

  ChallengeChannel.belongsTo(Challenge, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });
}
