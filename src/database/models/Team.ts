import {
  BelongsToGetAssociationMixin,
  DataTypes,
  HasManyCountAssociationsMixin,
  HasManyCreateAssociationMixin,
  HasManyGetAssociationsMixin,
  HasManyRemoveAssociationMixin,
  Model,
  Optional,
  Sequelize,
} from 'sequelize';
import { TeamServer } from './TeamServer';
import { initUser, User } from './User';
import { Ctf } from './Ctf';
import { Flag } from './Flag';

interface TeamAttributes {
  id: number;
  name: string;
  textChannelSnowflake?: string;
}

type TeamCreationAttributes = Optional<TeamAttributes, 'id' | 'textChannelSnowflake'>;

export class Team extends Model<TeamAttributes, TeamCreationAttributes> implements TeamAttributes {
  declare id: number;
  declare name: string;
  declare textChannelSnowflake: string;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  declare getTeamServer: BelongsToGetAssociationMixin<TeamServer>;
  // declare setTeamServer: BelongsToSetAssociationMixin<TeamServer, number>;
  // declare createTeamServer: BelongsToCreateAssociationMixin<TeamServer>;
  declare readonly TeamServer?: TeamServer;

  declare getUsers: HasManyGetAssociationsMixin<User>;
  declare countUsers: HasManyCountAssociationsMixin;
  // declare hasUser: HasManyHasAssociationMixin<User, number>;
  // declare hasUsers: HasManyHasAssociationsMixin<User, number>;
  // declare setUsers: HasManySetAssociationsMixin<User, number>;
  // declare addUser: HasManyAddAssociationMixin<User, number>;
  // declare addUsers: HasManyAddAssociationsMixin<User, number>;
  declare removeUser: HasManyRemoveAssociationMixin<User, number>;
  // declare removeUsers: HasManyRemoveAssociationsMixin<User, number>;
  declare createUser: HasManyCreateAssociationMixin<User>;
  declare readonly Users?: User[];

  async getPoints(): Promise<number> {
    const users = await this.getUsers({
      attributes: [],
      include: [
        {
          model: Flag,
          required: true,
          attributes: ['pointValue'],
        },
      ],
    });

    return users.flatMap((user) => user.Flags).reduce((accum, curr) => accum + (curr?.pointValue || 0), 0);
  }
}

export function initTeam(sequelize: Sequelize) {
  Team.init(
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
      textChannelSnowflake: {
        type: DataTypes.STRING,
        defaultValue: '',
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  Team.belongsTo(TeamServer, {
    onDelete: 'RESTRICT',
    foreignKey: {
      allowNull: false,
    },
  });

  initUser(sequelize);
  Team.hasMany(User);
}
