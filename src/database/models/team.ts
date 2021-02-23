import { Client } from 'discord.js';
import { CTF, Invite, User } from '.';
import { InviteRow, TeamRow, UserRow } from '../schemas';
import query from '../database';
import logger from '../../log';

export default class Team {
  row: TeamRow;

  constructor(row: TeamRow) {
    this.row = row;
  }
  /** Team Creation / Deletion */
  // makeTeam made in TeamServer

  async deleteTeam(client: Client) {
    const teamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
    const ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    await teamServer.deleteChannel(client, this.row.text_channel_snowflake);
    /** Remove every team member's team roles */
    await teamServer.deleteRole(client, this.row.team_role_snowflake_team_server);
    if (teamServer.row.guild_snowflake !== ctf.row.guild_snowflake) {
      await ctf.deleteRole(client, this.row.team_role_snowflake_main);
    }
    await query(`DELETE FROM teams WHERE id = ${this.row.id}`);
    logger(`Deleted team "${this.row.name}" from ctf "${ctf.row.name}`);
    /** Make and assign each member a new team */
  }

  /** Team Setters */
  // Valid Role in the TeamServer, unique among other Teams <- taken care of because it's made, not specified
  async setTeamRoleSnowflakeTeamServer(team_role_snowflake_team_server: string) {
    await query(`UPDATE teams SET team_role_snowflake_team_server = ${team_role_snowflake_team_server} WHERE id = ${this.row.id}`);
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

  async setTeamServerID(client: Client, team_server_id: number) {
    const newTeamServer = await CTF.fromIdTeamServer(team_server_id);
    if (!(await newTeamServer.hasSpace())) throw new Error('team server is full');

    if (this.row.team_server_id) /** If there is a previous team server */ {
      // Delete old text channel and team server role
      const oldTeamServer = await CTF.fromIdTeamServer(this.row.team_server_id);
      await oldTeamServer.deleteChannel(client, this.row.text_channel_snowflake);
      await oldTeamServer.deleteRole(client, this.row.team_role_snowflake_team_server);
    }

    await query(`UPDATE teams SET team_server_id = $1 WHERE id = ${this.row.id}`, [team_server_id]);
    this.row.team_server_id = team_server_id;

    // Make new text channel and team server role
    const textChannel = await newTeamServer.makeChannel(client, this.row.name.toLowerCase().replace(' ', '-'));
    await textChannel.setParent(newTeamServer.row.team_category_snowflake);
    await this.setTextChannelSnowflake(textChannel.id);

    const role = await newTeamServer.makeRole(client, this.row.name);
    await this.setTeamRoleSnowflakeTeamServer(role.id);
    /** Give every team member the role */
    // Invite all current users
  }

  // Unique per CTF
  async setName(name: string) {
    await query(`UPDATE teams SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE teams SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  async setColor(color: string) {
    await query(`UPDATE teams SET color = $1 WHERE id = ${this.row.id}`, [color]);
    this.row.color = color;
  }

  async setCaptain(captain_user_id: number) {
    await query(`UPDATE teams SET captain_user_id = $1 WHERE id = ${this.row.id}`, [captain_user_id]);
    this.row.captain_user_id = captain_user_id;
  }

  /** Invite Creation */
  async createInvite(user_id: number) {
    const { rows: existingRows } = await query(`SELECT id FROM invites WHERE team_id = ${this.row.id} and user_id = $1`, [user_id]);
    if (existingRows && existingRows.length > 0) throw new Error('invite already exists');

    const { rows } = await query(`INSERT INTO invites(user_id, team_id, was_invited) VALUES ($1, ${this.row.id}, true) RETURNING *`, [user_id]);
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
}
