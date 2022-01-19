import { CategoryChannel, Client, ColorResolvable, Guild, GuildChannel, Role, TextChannel } from 'discord.js';
import { logger } from '../../log';
import { CTF, Team } from '.';
import { CategoryChannelRow, ChallengeChannelRow, TeamRow, TeamServerRow } from '../schemas';
import query from '../database';
import { adminCommands, userCommands } from '../../discord/events/interaction/interaction';
import { createDiscordNullError } from '../../errors/DiscordNullError';

export default class TeamServer {
  row: TeamServerRow;
  ctf: CTF;

  constructor(row: TeamServerRow, ctf: CTF) {
    this.row = row;
    this.ctf = ctf;
  }

  /** TeamServer Creation / Deletion */
  // createTeamServer made in CTF

  async deleteTeamServer(client: Client) {
    // TODO: Does deleting a team server delete all of the associated teams just like with a ctf?
    const teams = await this.getAllTeams();
    const guild = client.guilds.resolve(this.row.guild_snowflake);
    if (!guild) throw createDiscordNullError('teamserver_guild');
    const mainGuild = this.ctf.getGuild(client);

    // Delete all team roles and channels
    teams.forEach((team) => {
      if (team.row.text_channel_snowflake) void guild.channels.resolve(team.row.text_channel_snowflake)?.delete();
      if (team.row.team_role_snowflake_team_server)
        void guild.roles.resolve(team.row.team_role_snowflake_team_server)?.delete();
    });
    logger.info(`Deleted all team channels and roles.`);

    // delete all category and challenge channels

    // async queue these for deleting
    await Promise.all(
      (await this.getAllChallengeChannels()).map((chan) => guild.channels.resolve(chan.channel_snowflake)?.delete()),
    );
    await Promise.all(
      (await this.getAllCategoryChannels()).map((chan) => guild.channels.resolve(chan.channel_snowflake)?.delete()),
    );

    // TODO: Same thing— if main is a team server and we remove the team server part, do we want the info channel removed still?
    // Remove channels and categories made during creation
    await guild.roles.resolve(this.row.participant_role_snowflake)?.delete();
    this.deleteChannel(client, this.row.info_channel_snowflake, this.row.team_category_snowflake);
    logger.info('Deleted CTF-Related roles, channels, and categories');

    if (this.row.invite_channel_snowflake)
      await mainGuild.channels.resolve(this.row.invite_channel_snowflake)?.delete();
    if (this.row.invite_role_snowflake) await mainGuild.roles.resolve(this.row.invite_role_snowflake)?.delete();
    logger.info('Deleted TeamServer-related channels from main guild');

    await query(`DELETE FROM team_servers WHERE id = ${this.row.id}`);
    logger.info(`Deleted **${this.row.name}** TeamServer`);
  }

  async setServerRole(role: Role) {
    await query(`UPDATE team_servers SET invite_role_snowflake = ${role.id} WHERE id = ${this.row.id}`);
    this.row.invite_role_snowflake = role.id;
    logger.info(`Made a role for **${this.row.name}**`);
  }

  async setServerInvite(client: Client) {
    if (!this.row.info_channel_snowflake) throw createDiscordNullError('info_channel_snowflake');
    const infoChannel = client.guilds
      .resolve(this.row.guild_snowflake)
      ?.channels.resolve(this.row.info_channel_snowflake);
    if (!infoChannel || !infoChannel.isText() || infoChannel.isThread())
      throw createDiscordNullError('info_channel_snowflake');
    const invite = await infoChannel.createInvite({
      temporary: false,
      maxAge: 0,
    });
    await query(`UPDATE team_servers SET server_invite = $1 WHERE id = ${this.row.id}`, [invite.code]);
    this.row.server_invite = invite.code;
    logger.info(`Made new invite for **${this.row.name}**`);
  }

  async setInviteChannelSnowflake(invite_channel_snowflake: string) {
    await query(
      `UPDATE team_servers SET invite_channel_snowflake = ${invite_channel_snowflake} WHERE id = ${this.row.id}`,
    );
    this.row.invite_channel_snowflake = invite_channel_snowflake;
    logger.info(`Set invite channel for **${this.row.name}** in main CTF`);
  }

  /** TeamServer Setters */
  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setInfoChannelSnowflake(info_channel_snowflake: string) {
    await query(`UPDATE team_servers SET info_channel_snowflake = ${info_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.info_channel_snowflake = info_channel_snowflake;
    logger.info(`Set info channel for **${this.row.name}** as ${info_channel_snowflake}`);
  }

  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setTeamCategorySnowflake(team_category_snowflake: string) {
    await query(
      `UPDATE team_servers SET team_category_snowflake = ${team_category_snowflake} WHERE id = ${this.row.id}`,
    );
    this.row.team_category_snowflake = team_category_snowflake;
    logger.info(`Set info channel for **${this.row.name}** as ${team_category_snowflake}`);
  }

  async setAdminRoleSnowflake(adminRoleSnowflake: string) {
    await query(`UPDATE team_servers SET admin_role_snowflake = $1 WHERE id = ${this.row.id}`, [adminRoleSnowflake]);
    this.row.admin_role_snowflake = adminRoleSnowflake;
  }

  async setParticipantRole(role: Role) {
    await query(`UPDATE team_servers SET participant_role_snowflake = ${role.id} WHERE id = ${this.row.id}`);
    this.row.participant_role_snowflake = role.id;
    logger.info(`Set **${this.row.name}**'s participant role`);
  }

  async getAllChallengeChannels() {
    const { rows: challenge_rows } = await query(
      `SELECT * FROM challenge_channels WHERE teamserver_id = ${this.row.id}`,
    );
    return challenge_rows as ChallengeChannelRow[];
  }

  async getAllCategoryChannels() {
    const { rows: category_rows } = await query(`SELECT * FROM category_channels WHERE teamserver_id = ${this.row.id}`);
    return category_rows as CategoryChannelRow[];
  }

  /**
   * Deletes if name conflict
   *
   * @param client
   * @param name
   */
  async makeChannel(client: Client, name: string) {
    const guild = this.getGuild(client);
    let channel = guild.channels.cache.find((c) => c.name === `${name}` && c.isText());
    if (channel) {
      await channel.delete();
      logger.info(`**${name}** found: deleted **${name}** channel`);
    }
    channel = await guild.channels.create(`${name}`, { type: 'GUILD_TEXT' });
    logger.info(`Created **${name}** channel`);
    return channel;
  }

  async renameChannel(client: Client, channel_snowflake: string, newName: string) {
    const guild = this.getGuild(client);
    const channel = guild.channels.resolve(channel_snowflake);
    if (channel) {
      const oldName = channel.name;
      await channel.setName(newName.toLowerCase().replace(' ', '-'));
      logger.info(`Renamed **${oldName}** channel to **${newName}**`);
    } else {
      throw new Error('channel not found');
    }
  }

  deleteChannel(client: Client, ...channel_snowflakes: (string | null)[]) {
    const guild = this.getGuild(client);
    channel_snowflakes.forEach((snowflake) => {
      if (snowflake)
        guild.channels
          .resolve(snowflake)
          ?.delete()
          .then((c) => {
            logger.info(`${(c as GuildChannel).name} found: deleted that channel`);
          })
          .catch(() => {
            logger.info(`Channel with id ${snowflake} not found`);
          });
    });
  }

  /**
   * Doesn't delete if name conflict
   *
   * @param client
   * @param name
   */
  async makeCategory(client: Client, name: string): Promise<CategoryChannel> {
    const guild = this.getGuild(client);
    let category = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'GUILD_CATEGORY');
    if (!category) {
      category = await guild.channels.create(`${name}`, { type: 'GUILD_CATEGORY' });
      logger.info(`**${name}** category not found: created **${name}** category`);
    }
    return category as CategoryChannel;
  }

  /** Team Creation */
  async makeTeam(client: Client, ctf: CTF, name: string) {
    // const teams = (await ctf.getAllTeams()).filter(
    //   (team) =>
    //     team.row.name === name ||
    //     team.row.name.toLowerCase().replace(' ', '-') === name.toLowerCase().replace(' ', '-'),
    // );
    // if (teams.length !== 0) throw new DupeTeamError();
    const { rows } = await query('INSERT INTO teams(name) VALUES ($1) RETURNING *', [name]);
    const team = new Team(rows[0] as TeamRow);
    await team.setTeamServerID(client, this.row.id);

    // The team server role has already been created, this is for the main server role
    // await team.setTeamRoleSnowflakeMain(
    //   this.row.guild_snowflake === ctf.row.guild_snowflake
    //     ? team.row.team_role_snowflake_team_server
    //     : (await ctf.makeRole(client, `Team ${name}`)).id,
    // );
    return team;
  }

  /** Team Retrieval */
  async fromNameTeam(name: string) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and name = $1`, [name]);
    if (rows.length === 0) throw new Error('no team with that name in this ctf');
    return new Team(rows[0] as TeamRow);
  }

  async fromRoleTeam(team_role_snowflake: string) {
    logger.info(`Looking for **${team_role_snowflake}**...`);
    const { rows } = await query(
      `SELECT * FROM teams WHERE (team_role_snowflake_team_server = $1 or team_role_snowflake_main = $1) and team_server_id = ${this.row.id} `,
      [team_role_snowflake],
    );
    if (rows.length !== 0) return new Team(rows[0] as TeamRow);
    throw new Error('no team with that role in this server');
  }

  async fromChannelTeam(text_channel_snowflake: string) {
    const { rows } = await query(
      `SELECT * FROM teams WHERE team_server_id = ${this.row.id} and text_channel_snowflake = $1`,
      [text_channel_snowflake],
    );
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

  async makeRole(client: Client, name: string, useExisting = true) {
    const guild = this.getGuild(client);
    const existingRole = guild.roles.cache.find((role) => role.name === name);
    if (useExisting && existingRole) {
      logger.info(`role ${name} already exists, using it`);
      return existingRole;
    }
    const role = await guild.roles.create({ name: `${name}` });
    logger.info(`Made new role **${name}** in TeamServer **${this.row.name}**`);
    return role;
  }

  async deleteRole(client: Client, role_snowflake: string) {
    const guild = this.getGuild(client);
    const roleToDelete = guild.roles.resolve(role_snowflake);
    if (roleToDelete) {
      await roleToDelete.delete();
      logger.info(`**${roleToDelete.name}** role found and deleted`);
      return;
    }
    logger.info(`**${role_snowflake}** role not found`);
  }

  async setRoleColor(client: Client, role_snowflake: string, color: ColorResolvable) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.cache.find((role) => role.id === role_snowflake);
    if (roleToChange) {
      await roleToChange.setColor(color);
      logger.info(`**${roleToChange.name}**'s color is now **${String(color)}**`);
      return;
    }
    logger.info(`**${role_snowflake}** role not found`);
  }

  async setRoleName(client: Client, role_snowflake: string, new_name: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.cache.find((role) => role.id === role_snowflake);
    if (roleToChange) {
      await roleToChange.setName(new_name);
      logger.info(`Renamed **${roleToChange.name}** role to **${new_name}**`);
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async registerCommands(client: Client) {
    const guild = this.getGuild(client);
    const applicationAdminCommands = await guild.commands.set(adminCommands);
    if (!this.row.admin_role_snowflake) throw createDiscordNullError('admin_role_snowflake');
    // ensure only admins can use admin commands
    for (const com of applicationAdminCommands.values()) {
      await com.permissions.add({
        permissions: [{ id: this.row.admin_role_snowflake, type: 'ROLE', permission: true }],
      });
    }
    const applicationUserCommands = await guild.commands.set(userCommands);
    // ensure only users can use user commands
    for (const com of applicationUserCommands.values()) {
      await com.permissions.add({
        permissions: [{ id: this.row.participant_role_snowflake, type: 'ROLE', permission: true }],
      });
    }
  }

  async hasSpace(print?: boolean) {
    const hasSpace = (await this.getAllTeams()).length < this.row.team_limit;
    if (print) logger.info(`Team server **${this.row.name}** has${hasSpace ? ' ' : ' no '}space`);
    return hasSpace;
  }

  async fromIdTeam(team_id: number) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and id = ${team_id}`);
    if (rows.length === 0) throw new Error('no team associated with that id in this server');
    return new Team(rows[0] as TeamRow);
  }

  static async getGuildFromTeamServerID(client: Client, teamServerID: number) {
    const { rows } = await query(`SELECT guild_snowflake FROM team_servers WHERE id = ${teamServerID}`);
    const guildID = (rows[0] as TeamServerRow).guild_snowflake;
    return client.guilds.resolve(guildID);
  }
}
