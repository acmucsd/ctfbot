import { Client } from 'discord.js';
import logger from '../../log';
import { Team } from '.';
import { TeamRow, TeamServerRow } from '../schemas';
import query from '../database';

export default class TeamServer {
  row: TeamServerRow;

  constructor(row: TeamServerRow) {
    this.row = row;
  }

  /** TeamServer Creation / Deletion */
  // createTeamServer made in CTF

  async deleteTeamServer() {
    await query(`DELETE FROM team_servers WHERE id = ${this.row.id}`);
    logger(`Deleted "${this.row.name}" TeamServer`);
  }

  /** TeamServer Setters */
  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setInfoChannelSnowflake(info_channel_snowflake: string) {
    await query(`UPDATE team_servers SET info_channel_snowflake = ${info_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.info_channel_snowflake = info_channel_snowflake;
    logger(`Set info channel for "${this.row.name}" as ${info_channel_snowflake}`);
  }

  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setTeamCategorySnowflake(team_category_snowflake: string) {
    await query(`UPDATE team_servers SET team_category_snowflake = ${team_category_snowflake} WHERE id = ${this.row.id}`);
    this.row.team_category_snowflake = team_category_snowflake;
    logger(`Set info channel for "${this.row.name}" as ${team_category_snowflake}`);
  }

  async makeChannel(client: Client, name: string) {
    const guild = client.guilds.cache.find((server) => server.id === this.row.guild_snowflake);
    let channel = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'text');
    if (!channel) {
      logger(`${name} channel not found: creating ${name} channel...`);
      channel = await guild.channels.create(`${name}`, { type: 'text' });
    }
    return channel.id;
  }

  async makeCategory(client: Client, name: string) {
    const guild = client.guilds.cache.find((server) => server.id === this.row.guild_snowflake);
    let channel = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'category');
    if (!channel) {
      logger(`${name} category not found: creating ${name} category...`);
      channel = await guild.channels.create(`${name}`, { type: 'category' });
    }
    return channel.id;
  }

  /** Team Creation */
  async makeTeam(name: string) {
    // Checks

    const { rows } = await query(`INSERT INTO teams(team_server_id, name) VALUES (${this.row.id}, $1) RETURNING *`, [name]);
    return new Team(rows[0] as TeamRow);
  }

  /** Team Retrieval */
  async fromNameTeam(name: string) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and name = $1`, [name]);
    if (rows.length === 0) throw new Error('no team with that name in this ctf');
    return new Team(rows[0] as TeamRow);
  }

  static async fromRoleTeam(team_role_snowflake: string) {
    const { rows } = await query('SELECT * FROM teams WHERE team_role_snowflake_main = $1 or team_role_snowflake_team_server = $1 ', [team_role_snowflake]);
    if (rows.length === 0) throw new Error('no team with that role in this server');
    return new Team(rows[0] as TeamRow);
  }

  static async fromChannelTeam(text_channel_snowflake: string) {
    const { rows } = await query('SELECT * FROM teams WHERE  and text_channel_snowflake = $1', [text_channel_snowflake]);
    if (rows.length === 0) throw new Error('no team associated with that channel');
    return new Team(rows[0] as TeamRow);
  }

  async getAllTeams() {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id}`);
    return rows.map((row) => new Team(row as TeamRow));
  }
}
