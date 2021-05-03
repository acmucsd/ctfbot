import { Client } from 'discord.js';
import { CTF, Invite, User } from '.';
import { InviteRow, TeamRow, UserRow } from '../schemas';
import query from '../database';
import { logger } from '../../log';
import { NoRoomError } from '../../errors';

export default class Team {
  row: TeamRow;

  constructor(row: TeamRow) {
    this.row = row;
  }

  static teamCompare(a: minimalTeam, b: minimalTeam) {
    const pointDiff = a.points - b.points;
    if (pointDiff !== 0) {
      return pointDiff;
    }

    const accDiff = a.accuracy - b.accuracy;
    if (accDiff !== 0) {
      return accDiff;
    }

    return a.name.localeCompare(b.name);
  }

  /** Team Creation / Deletion */
  // makeTeam made in TeamServer

  async deleteTeam(client: Client) {
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    await teamServer.deleteChannel(client, this.row.text_channel_snowflake);
    /** TODO: Remove every team member's team roles */
    await teamServer.deleteRole(client, this.row.team_role_snowflake_team_server).catch(() => {
      /* Do nothing, because it means the team server already deleted*/
    });
    await ctf.deleteRole(client, this.row.team_role_snowflake_team_server).catch(() => {
      /* Do nothing, because it means the team server already deleted*/
    });
    if (teamServer.row.guild_snowflake !== ctf.row.guild_snowflake) {
      await ctf.deleteRole(client, this.row.team_role_snowflake_main).catch(() => {
        /* Do nothing, because it means the team server part of the main server already deleted*/
      });
    }
    await query(`DELETE FROM teams WHERE id = ${this.row.id}`);
    logger(`Deleted team **${this.row.name}** from ctf **${ctf.row.name}**`);
    /** TODO: Make and assign each member a new team */
  }

  /** Team Setters */
  // Valid Role in the TeamServer, unique among other Teams <- taken care of because it's made, not specified
  async setTeamRoleSnowflakeTeamServer(team_role_snowflake_team_server: string) {
    await query(
      `UPDATE teams SET team_role_snowflake_team_server = ${team_role_snowflake_team_server} WHERE id = ${this.row.id}`,
    );
    this.row.team_role_snowflake_team_server = team_role_snowflake_team_server;
  }

  async setTeamRoleSnowflakeMain(team_role_snowflake_main: string) {
    await query(`UPDATE teams SET team_role_snowflake_main = ${team_role_snowflake_main} WHERE id = ${this.row.id}`);
    this.row.team_role_snowflake_main = team_role_snowflake_main;
  }

  // Valid Channel in the TeamServer, unique among other Teams <- taken care of because it's made, not specified
  async setTextChannelSnowflake(text_channel_snowflake: string) {
    await query(`UPDATE teams SET text_channel_snowflake = ${text_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.text_channel_snowflake = text_channel_snowflake;
  }

  async setTeamCaptain() {}

  async setTeamServerID(client: Client, team_server_id: number) {
    const newTeamServer = await CTF.fromIdTeamServer(team_server_id);
    if (!(await newTeamServer.hasSpace())) throw new NoRoomError();

    if (this.row.team_server_id) {
      /** If there is a previous team server */ // Delete old text channel and team server role
      const oldTeamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
      await oldTeamServer.deleteChannel(client, this.row.text_channel_snowflake);
      await oldTeamServer.deleteRole(client, this.row.team_role_snowflake_team_server);
    }

    await query(`UPDATE teams SET team_server_id = $1 WHERE id = ${this.row.id}`, [team_server_id]);
    this.row.team_server_id = team_server_id;

    // Make their team role
    const role = await newTeamServer.makeRole(client, this.row.name);
    await this.setTeamRoleSnowflakeTeamServer(role.id);

    // Make new text channel and team server role
    const textChannel = await newTeamServer.makeChannel(client, this.row.name.toLowerCase().replace(' ', '-'));
    await textChannel.setParent(newTeamServer.row.team_category_snowflake);
    // Make sure only the team can see their channel
    /** TODO: Do we want admins being able to see every channel? */
    await textChannel.overwritePermissions([
      {
        id: textChannel.guild.roles.everyone,
        deny: ['VIEW_CHANNEL'],
      },
      {
        id: textChannel.guild.roles.resolve(this.row.team_role_snowflake_team_server),
        allow: ['VIEW_CHANNEL'],
      },
    ]);
    /*      */
    await this.setTextChannelSnowflake(textChannel.id);
    /** Give every team member the role */
    // Invite all current users
  }

  // Unique per CTF
  async setName(client: Client, newName: string) {
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    const oldName = this.row.name;

    const teams = (await ctf.getAllTeams()).filter((team) => team.row.name === newName);
    if (teams.length !== 0) throw new Error('a team with that name already exists');

    await query(`UPDATE teams SET name = $1 WHERE id = ${this.row.id}`, [newName]);
    this.row.name = newName;

    await ctf.setRoleName(client, this.row.team_role_snowflake_main, newName);
    if (this.row.team_role_snowflake_main !== this.row.team_role_snowflake_team_server) {
      await teamServer.setRoleName(client, this.row.team_role_snowflake_team_server, newName);
    }
    await teamServer.renameChannel(client, this.row.text_channel_snowflake, newName);
    return `Changed **${oldName}**'s name to **${newName}**`;
  }

  async setDescription(description: string) {
    await query(`UPDATE teams SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
    return `Changed **${this.row.name}**'s description to **${description}**`;
  }

  async setColor(client: Client, color: string) {
    if (!/^([0-9a-f]{6})$/i.test(color)) {
      throw new Error('invalid color');
    }
    const oldColor = this.row.color?.toLowerCase();
    await query(`UPDATE teams SET color = $1 WHERE id = ${this.row.id}`, [color.toLowerCase()]);
    this.row.color = color;
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    await teamServer.setRoleColor(client, this.row.team_role_snowflake_team_server, color);
    if (teamServer.row.guild_snowflake !== ctf.row.guild_snowflake) {
      await ctf.setRoleColor(client, this.row.team_role_snowflake_main, color);
    }
    return `Changed **${this.row.name}**'s color ${oldColor != null ? `from **${oldColor}** ` : ''}to **${color}**`;
  }

  async setCaptain(captain_user_id: number) {
    await query(`UPDATE teams SET captain_user_id = $1 WHERE id = ${this.row.id}`, [captain_user_id]);
    this.row.captain_user_id = captain_user_id;
  }

  /** Invite Creation */
  async createInvite(user_id: number) {
    const { rows: existingRows } = await query(
      `SELECT id FROM invites WHERE team_id = ${this.row.id} and user_id = $1`,
      [user_id],
    );
    if (existingRows && existingRows.length > 0) throw new Error('invite already exists');

    const {
      rows,
    } = await query(
      `INSERT INTO invites(user_id, team_id, was_invited) VALUES ($1, ${this.row.id}, true) RETURNING *`,
      [user_id],
    );
    return new Invite(rows[0] as InviteRow);
  }

  /** Invite Retrieval */
  async fromUserIDInvite(user_id: number) {
    const { rows } = await query(`SELECT * FROM invites WHERE team_id = ${this.row.id} and user_id = $1`, [user_id]);
    if (rows.length === 0) throw new Error('no invite for that user');
    return new Invite(rows[0] as InviteRow);
  }

  /** User Retrieval */
  async getAllUsers() {
    const { rows } = await query(`SELECT * FROM users WHERE team_id = ${this.row.id}`);
    return rows.map((row) => new User(row as UserRow));
  }

  async calculateAccuracy(category?: string) {
    await new Promise(() => 7);
    return 7;
  }

  async calculatePoints(category?: string) {
    await new Promise(() => 7);
    return 7;
  }

  async getMinimalTeam(category?: string): Promise<minimalTeam> {
    const team = {
      name: this.row.name,
      points: await this.calculatePoints(category),
      accuracy: await this.calculateAccuracy(category),
      id: this.row.id,
    };
    return team;
  }
}

export interface minimalTeam {
  name: string;
  points: number;
  accuracy: number;
  id: number;
}
