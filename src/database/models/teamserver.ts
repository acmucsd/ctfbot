import { CategoryChannel, Client, Guild } from 'discord.js';
import { logger } from '../../log';
import { CTF, Team } from '.';
import { CategoryChannelRow, ChallengeChannelRow, TeamRow, TeamServerRow } from '../schemas';
import query from '../database';
import { DupeTeamError } from '../../errors';

export default class TeamServer {
  row: TeamServerRow;

  constructor(row: TeamServerRow) {
    this.row = row;
  }

  /** TeamServer Creation / Deletion */
  // createTeamServer made in CTF

  async deleteTeamServer(client: Client) {
    // TODO: Does deleting a team server delete all of the associated teams just like with a ctf?
    const teams = await this.getAllTeams();
    const guild = client.guilds.resolve(this.row.guild_snowflake);

    // Delete all team roles and channels
    teams.forEach((team) => {
      void guild.channels.resolve(team.row.text_channel_snowflake).delete();
      // TODO: If main is a team server and we remove the team server part, do we want the roles removed still?
      void guild.roles.resolve(team.row.team_role_snowflake_team_server).delete();
    });
    logger(`Deleted all team channels and roles.`);

    // delete all category and challenge channels
    const { rows: challenge_rows } = await query(
      `SELECT * FROM challenge_channels WHERE teamserver_id = ${this.row.id}`,
    );
    const challengeChannels = challenge_rows as ChallengeChannelRow[];
    const { rows: category_rows } = await query(`SELECT * FROM category_channels WHERE teamserver_id = ${this.row.id}`);
    const categoryChannels = category_rows as CategoryChannelRow[];

    // async queue these for deleting
    challengeChannels.forEach((chan) => void guild.channels.resolve(chan.channel_snowflake).delete());
    categoryChannels.forEach((chan) => void guild.channels.resolve(chan.channel_snowflake).delete());

    // TODO: Same thing— if main is a team server and we remove the team server part, do we want the info channel removed still?
    // Remove channels and categories made during creation
    await guild.channels.resolve(this.row.info_channel_snowflake).delete();
    await guild.channels.resolve(this.row.team_category_snowflake).delete();
    logger('Deleted CTF-Related channels and categories');

    await query(`DELETE FROM team_servers WHERE id = ${this.row.id}`);
    logger(`Deleted **${this.row.name}** TeamServer`);
  }

  /** TeamServer Setters */
  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setInfoChannelSnowflake(info_channel_snowflake: string) {
    await query(`UPDATE team_servers SET info_channel_snowflake = ${info_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.info_channel_snowflake = info_channel_snowflake;
    logger(`Set info channel for **${this.row.name}** as ${info_channel_snowflake}`);
  }

  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setTeamCategorySnowflake(team_category_snowflake: string) {
    await query(
      `UPDATE team_servers SET team_category_snowflake = ${team_category_snowflake} WHERE id = ${this.row.id}`,
    );
    this.row.team_category_snowflake = team_category_snowflake;
    logger(`Set info channel for **${this.row.name}** as ${team_category_snowflake}`);
  }

  /**
   * Deletes if name conflict
   *
   * @param client
   * @param name
   */
  async makeChannel(client: Client, name: string) {
    const guild = this.getGuild(client);
    let channel = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'text');
    if (channel) {
      await channel.delete();
      logger(`**${name}** found: deleted **${name}** channel`);
    }
    channel = await guild.channels.create(`${name}`, { type: 'text' });
    logger(`Created **${name}** channel`);
    return channel;
  }

  async renameChannel(client: Client, channel_snowflake: string, newName: string) {
    const guild = this.getGuild(client);
    const channel = guild.channels.resolve(channel_snowflake);
    if (channel) {
      const oldName = channel.name;
      await channel.setName(newName.toLowerCase().replace(' ', '-'));
      logger(`Renamed **${oldName}** channel to **${newName}**`);
    } else {
      throw new Error('channel not found');
    }
  }

  async deleteChannel(client: Client, channel_snowflake: string) {
    const guild = this.getGuild(client);
    const channel = guild.channels.resolve(channel_snowflake);
    if (channel) {
      await channel.delete();
      logger(`Channel with id ${channel_snowflake} found: deleted that channel`);
      return;
    }
    logger(`Channel with id ${channel_snowflake} not found`);
  }

  /**
   * Doesn't delete if name conflict
   *
   * @param client
   * @param name
   */
  async makeCategory(client: Client, name: string) {
    const guild = this.getGuild(client);
    let category = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'category');
    if (!category) {
      category = await guild.channels.create(`${name}`, { type: 'category' });
      logger(`**${name}** category not found: created **${name}** category`);
    }
    return category;
  }

  /** Team Creation */
  async makeTeam(client: Client, ctf: CTF, name: string) {
    const teams = (await ctf.getAllTeams()).filter(
      (team) =>
        team.row.name === name ||
        team.row.name.toLowerCase().replace(' ', '-') === name.toLowerCase().replace(' ', '-'),
    );
    if (teams.length !== 0) throw new DupeTeamError();
    const { rows } = await query('INSERT INTO teams(name) VALUES ($1) RETURNING *', [name]);
    const team = new Team(rows[0] as TeamRow);
    await team.setTeamServerID(client, this.row.id);

    if (this.row.guild_snowflake !== ctf.row.guild_snowflake) {
      const role = await ctf.makeRole(client, name);
      await team.setTeamRoleSnowflakeMain(role.id);
    } else {
      await team.setTeamRoleSnowflakeMain(team.row.team_role_snowflake_team_server);
    }
    return team;
  }

  /** Team Retrieval */
  async fromNameTeam(name: string) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and name = $1`, [name]);
    if (rows.length === 0) throw new Error('no team with that name in this ctf');
    return new Team(rows[0] as TeamRow);
  }

  async fromRoleTeam(team_role_snowflake: string) {
    logger(`Looking for **${team_role_snowflake}**...`);
    const {
      rows,
    } = await query(
      `SELECT * FROM teams WHERE (team_role_snowflake_team_server = $1 or team_role_snowflake_main = $1) and team_server_id = ${this.row.id} `,
      [team_role_snowflake],
    );
    if (rows.length !== 0) return new Team(rows[0] as TeamRow);
    throw new Error('no team with that role in this server');
  }

  async fromChannelTeam(text_channel_snowflake: string) {
    const {
      rows,
    } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and text_channel_snowflake = $1`, [
      text_channel_snowflake,
    ]);
    if (rows.length === 0) throw new Error('no team associated with that channel');
    return new Team(rows[0] as TeamRow);
  }

  async getAllTeams() {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id}`);
    return rows.map((row) => new Team(row as TeamRow));
  }

  /** Misc */
  getGuild(client: Client): Guild {
    const guild = client.guilds.resolve(this.row.guild_snowflake);
    if (!guild) throw Error('No guild corresponds with the current CTF id');
    return guild;
  }

  async makeRole(client: Client, name: string) {
    const guild = this.getGuild(client);
    if (guild.roles.cache.find((role) => role.name === name)) throw new Error('Role with that name already exists');
    const role = await guild.roles.create({ data: { name: `${name}` } });
    logger(`Made new role **${name}** in TeamServer **${this.row.name}**`);
    return role;
  }

  async deleteRole(client: Client, role_snowflake: string) {
    const guild = this.getGuild(client);
    const roleToDelete = guild.roles.resolve(role_snowflake);
    if (roleToDelete) {
      await roleToDelete.delete();
      logger(`**${roleToDelete.name}** role found and deleted`);
      return;
    }
    logger(`**${roleToDelete.name}** role not found`);
  }

  async setRoleColor(client: Client, role_snowflake: string, color: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.cache.find((role) => role.id === role_snowflake);
    if (roleToChange) {
      await roleToChange.setColor(color);
      logger(`**${roleToChange.name}**'s color is now **${color}**`);
      return;
    }
    logger(`**${roleToChange.name}** role not found`);
  }

  async setRoleName(client: Client, role_snowflake: string, new_name: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.cache.find((role) => role.id === role_snowflake);
    if (roleToChange) {
      await roleToChange.setName(new_name);
      logger(`Renamed **${roleToChange.name}** role to **${new_name}**`);
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async hasSpace(print?: boolean) {
    const hasSpace = (await this.getAllTeams()).length < this.row.team_limit;
    if (print) logger(`Team server **${this.row.name}** has${hasSpace ? ' ' : ' no '}space`);
    return hasSpace;
  }

  async fromIdTeam(team_id: number) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and id = ${team_id}`);
    if (rows.length === 0) throw new Error('no team associated with that id in this server');
    return new Team(rows[0] as TeamRow);
  }
}
