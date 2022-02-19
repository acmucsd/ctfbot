import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { User } from './User';
import { Team } from './Team';

interface InviteAttributes {
  id: number;
  wasInvited: boolean;
  accepted: boolean;
}

type InviteCreationAttributes = Optional<InviteAttributes, 'id' | 'accepted'>;

export class Invite extends Model<InviteAttributes, InviteCreationAttributes> implements InviteAttributes {
  declare id: number;
  declare wasInvited: boolean;
  declare accepted: boolean;

  // declare readonly createdAt: Date;
  // declare readonly updatedAt: Date;

  // declare getUser: BelongsToGetAssociationMixin<User>;
  // declare setUser: BelongsToSetAssociationMixin<User, number>;
  // declare createUser: BelongsToCreateAssociationMixin<User>;
  declare readonly User?: User;

  // declare getTeam: BelongsToGetAssociationMixin<Team>;
  // declare setTeam: BelongsToSetAssociationMixin<Team, number>;
  // declare createTeam: BelongsToCreateAssociationMixin<Team>;
  declare readonly Team?: Team;
}

export function initInvite(sequelize: Sequelize) {
  Invite.init(
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      wasInvited: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
      },
      accepted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    },
    {
      sequelize,
    },
  );

  Invite.belongsTo(User, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });

  Invite.belongsTo(Team, {
    onDelete: 'CASCADE',
    foreignKey: {
      allowNull: false,
    },
  });
}
