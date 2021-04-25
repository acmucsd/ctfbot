import { Client, Guild, GuildMember, TextChannel, User as DiscordUser, PartialUser } from 'discord.js';
import { Category, Team, TeamServer, User } from '.';
import { CategoryRow, ChallengeRow, CTFRow, TeamServerRow, UserRow } from '../schemas';
import query from '../database';
import TOSMessage from '../../tos.json';
import { logger } from '../../log';
import CommandInteraction from '../../events/interaction/compat/CommandInteraction';
import { subscribedMessageCallback, subscribedMessages } from '../../';
import { DupeTeamError, NoRoomError, NoTeamUserError, NoUserError } from '../../errors';
import Challenge from './challenge';

export default class CTF {
  row: CTFRow;

  constructor(row: CTFRow) {
    this.row = row;
  }

  /* CTF Creation / Deletion */
  static async createCTF(client: Client, name: string, guildSnowflake: string) {
    // check if a CTF already exists in this guild
    const { rows: existingCTFs } = await query('SELECT id FROM ctfs WHERE guild_snowflake = $1', [guildSnowflake]);
    if (existingCTFs && existingCTFs.length > 0) throw new Error('cannot create a second CTF in this guild');

    const { rows: existingNames } = await query('SELECT id FROM ctfs WHERE name = $1', [name]);
    if (existingNames && existingNames.length > 0) throw new Error('cannot create ctf with a duplicate name');

    const { rows } = await query('INSERT INTO ctfs(name, guild_snowflake) VALUES ($1, $2) RETURNING *', [
      name,
      guildSnowflake,
    ]);
    logger(`Created new ctf **${name}**`);
    // TODO: Fix ordering for channels
    // TODO: Make a "Competitor" role for easier time giving people access to
    //       social channels?
    const ctf = new CTF(rows[0] as CTFRow);
    const info = await ctf.makeChannelCategory(client, 'Info');
    await ctf.setInfoCategory(info.id);
    const tos = await ctf.makeChannel(client, 'tos');
    await tos.setParent(info.id);
    await tos.updateOverwrite(tos.guild.roles.everyone, { SEND_MESSAGES: false, ADD_REACTIONS: false });
    await ctf.setTOSChannel(tos.id);
    await (tos as TextChannel).createWebhook('Terms of Service').then(async (webhook) => {
      await webhook.send(TOSMessage).then(async (message) => {
        await message.react('👍');
      });
      await ctf.setTOSWebhook(webhook.id);
    });
    return ctf;
  }

  async deleteCTF(client: Client) {
    // because of Foreign Key constraints, deletes all associated Team Servers, Teams, Categories, and Challenges
    const teams = await this.getAllTeams();
    for (const team of teams) {
      await team.deleteTeam(client);
    }
    const webhook = await client.fetchWebhook(this.row.tos_webhook_snowflake);
    await webhook.delete();
    subscribedMessages.delete(this.row.tos_webhook_snowflake);
    logger('Removed TOS webhook from the server');
    const tos = client.channels.resolve(this.row.tos_channel_snowflake);
    await tos.delete();
    logger('Removed TOS channel');
    await client.channels.resolve(this.row.info_category_snowflake).delete();
    (await this.getAllTeamServers()).forEach((server) => {
      void server.deleteTeamServer(client);
    });
    await query(`DELETE FROM ctfs WHERE id = ${this.row.id}`);
    logger(`Deleted ctf **${this.row.name}**`);
  }

  cacheTOS(TOScache: Map<string, subscribedMessageCallback>) {
    TOScache.set(this.row.tos_webhook_snowflake, {
      id: this.row.id,
      callback: async (user: DiscordUser | PartialUser) => {
        try {
          await this.fromUserSnowflakeUser(user.id);
        } catch (e) {
          if (e instanceof NoUserError) {
            logger(`**${user.username}** has accepted TOS`);
            await this.createUser(user.client.guilds.resolve(this.row.guild_snowflake).members.resolve(user.id));
          }
        }
      },
    });
  }

  // No category supplied will give the top teams
  async getScoreboard(category?: string) {
    const { rows } = await query(`SELECT * FROM teams WHERE ctf_id = ${this.row.id}`);
    const teams = rows.map(async (teamRow) => await new Team(teamRow).getMinimalTeam(category));
    // eslint-disable-next-line @typescript-eslint/unbound-method
    const minimalTeams = (await Promise.all(teams)).sort(Team.teamCompare).slice(0, 20);
    logger(minimalTeams.map((team) => `${team.name} has ${team.points} with ${team.accuracy}`).toString());
  }

  // async getCategoryScoreboard(category: Category) {}
  //
  // async getTeamScoreboard(team: Team) {}

  static async fromWebhookCTF(tos_webhook_snowflake: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE tos_webhook_snowflake = $1', [tos_webhook_snowflake]);
    if (rows.length === 0) throw new Error('no ctf associated with that webhook');
    return new CTF(rows[0] as CTFRow);
  }

  async setInfoCategory(info_category_snowflake: string) {
    const { rows } = await query('SELECT id FROM ctfs WHERE info_category_snowflake = $1', [info_category_snowflake]);
    if (rows && rows.length > 0) throw new Error('ctf already uses that category');
    await query(`UPDATE ctfs SET info_category_snowflake = $1 WHERE id = ${this.row.id}`, [info_category_snowflake]);
    this.row.info_category_snowflake = info_category_snowflake;
    logger(`Set **${this.row.name}**'s info category`);
  }

  async setTOSChannel(tos_channel_snowflake: string) {
    const { rows } = await query('SELECT id FROM ctfs WHERE tos_channel_snowflake = $1', [tos_channel_snowflake]);
    if (rows && rows.length > 0) throw new Error('ctf already uses that channel');
    await query(`UPDATE ctfs SET tos_channel_snowflake = $1 WHERE id = ${this.row.id}`, [tos_channel_snowflake]);
    this.row.tos_channel_snowflake = tos_channel_snowflake;
    logger(`Set **${this.row.name}**'s TOS channel`);
  }

  async setTOSWebhook(tos_webhook_snowflake: string) {
    const { rows } = await query('SELECT id FROM ctfs WHERE tos_webhook_snowflake = $1', [tos_webhook_snowflake]);
    if (rows && rows.length > 0) throw new Error('ctf already uses that webhook');
    await query(`UPDATE ctfs SET tos_webhook_snowflake = $1 WHERE id = ${this.row.id}`, [tos_webhook_snowflake]);
    this.row.tos_webhook_snowflake = tos_webhook_snowflake;
    this.cacheTOS(subscribedMessages);
    logger(`Set **${this.row.name}**'s TOS webhook`);
  }

  /* CTF Retrieval */
  static async fromNameCTF(name: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE name = $1', [name]);
    if (rows.length === 0) throw new Error('no ctf associated with that name');
    return new CTF(rows[0] as CTFRow);
  }

  static async fromCTFGuildSnowflakeCTF(guild_snowflake: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE guild_snowflake = $1', [guild_snowflake]);
    if (rows.length === 0) throw new Error('no ctf associated with this guild');
    return new CTF(rows[0] as CTFRow);
  }

  static async fromIdCTF(ctf_id: number) {
    const { rows } = await query(`SELECT * FROM ctfs WHERE id = ${ctf_id}`);
    if (rows.length === 0) throw new Error('invalid ctf id');
    return new CTF(rows[0] as CTFRow);
  }

  /* CTF Setters */
  // Unique among CTFs
  async setName(name: string) {
    const { rows: existingNames } = await query('SELECT id FROM ctfs WHERE name = $1', [name]);
    if (existingNames && existingNames.length > 0) throw new Error('cannot create ctf with a duplicate name');
    await query(`UPDATE ctfs SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE ctfs SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
    if (description !== '') logger(`Set ${this.row.name}'s description to "${description}"`);
  }

  async setStartDate(startDate: Date) {
    await query(`UPDATE ctfs SET start_date = $1 WHERE id = ${this.row.id}`, [startDate]);
    this.row.start_date = startDate;
  }

  async setEndDate(endDate: Date) {
    await query(`UPDATE ctfs SET end_date = $1 WHERE id = ${this.row.id}`, [endDate]);
    this.row.end_date = endDate;
  }

  // Valid role in the CTF guild
  async setAdminRoleSnowflake(adminRoleSnowflake: string) {
    await query(`UPDATE ctfs SET admin_role_snowflake = $1 WHERE id = ${this.row.id}`, [adminRoleSnowflake]);
    this.row.admin_role_snowflake = adminRoleSnowflake;
  }

  // Valid channel in the CTF guild
  async setAnnouncementsChannelSnowflake(announcementsChannelSnowflake: string) {
    await query(`UPDATE ctfs SET announcements_channel_snowflake = $1 WHERE id = ${this.row.id}`, [
      announcementsChannelSnowflake,
    ]);
    this.row.announcements_channel_snowflake = announcementsChannelSnowflake;
  }

  /* Category Creation */
  async createCategory(client: Client, name: string) {
    // check if a category already exists with that name in this ctf
    const { rows: existingRows } = await query(
      `SELECT id FROM categories WHERE name = $1 and ctf_id = ${this.row.id}`,
      [name],
    );
    if (existingRows && existingRows.length > 0)
      throw new Error('cannot create a category with a duplicate name in this CTF');

    // create the channel category for this category
    const guild = this.getGuild(client);
    const category = await guild.channels.create(`${name}`, { type: 'category' });

    const {
      rows,
    } = await query(
      `INSERT INTO categories(ctf_id, name, channel_category_snowflake) VALUES (${this.row.id}, $1, $2) RETURNING *`,
      [name, category.id],
    );
    return new Category(rows[0] as CategoryRow, this);
  }

  /* Category Retrieval */
  async fromNameCategory(name: string) {
    const { rows } = await query(`SELECT * FROM categories WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (rows.length === 0) throw new Error('no category with that name in this ctf');
    return new Category(rows[0] as CategoryRow, this);
  }

  async fromChannelCategorySnowflakeCategory(channel_category_snowflake: string) {
    const {
      rows,
    } = await query(`SELECT * FROM categories WHERE channel_category_snowflake = $1 and ctf_id = ${this.row.id}`, [
      channel_category_snowflake,
    ]);
    if (rows.length === 0) throw new Error('no category with that snowflake in this ctf');
    return new Category(rows[0] as CategoryRow, this);
  }

  async getAllCategories() {
    const { rows } = await query(`SELECT * FROM categories WHERE ctf_id = ${this.row.id}`);
    return rows.map((row) => new Category(row as CategoryRow, this));
  }

  /* Challenge Retrieval */
  /** Challenge Retrieval */
  // async fromNameChallenge(name: string) {
  //   const { rows } = await query(`SELECT * FROM challenges WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
  //   if (rows.length === 0) throw new Error('no challenge with that name in this ctf');
  //   return new Challenge(rows[0] as ChallengeRow, this);
  // }

  async fromChannelSnowflakeChallenge(channel_snowflake: string) {
    const { rows } = await query(`SELECT * FROM challenges WHERE channel_snowflake = $1`, [channel_snowflake]);
    if (rows.length === 0) throw new Error('no challenge with that channel in this ctf');
    return new Challenge(rows[0] as ChallengeRow, this);
  }

  /* Team Server Creation */
  async createTeamServer(guild: Guild, name: string, team_limit: number) {
    const {
      rows: existingRows,
    } = await query(`SELECT id FROM team_servers WHERE ctf_id = ${this.row.id} and name = $1`, [name]);
    if (existingRows && existingRows.length > 0)
      throw new Error('cannot create a team server with a duplicate name in this ctf');

    const { rows: existingRows2 } = await query('SELECT id FROM team_servers WHERE guild_snowflake = $1', [guild.id]);
    if (existingRows2 && existingRows2.length > 0) throw new Error('guilds are limited to a single teamserver');

    const {
      rows,
    } = await query(
      `INSERT INTO team_servers(guild_snowflake, ctf_id, name, team_limit) VALUES ($1, ${this.row.id}, $2, $3) RETURNING *`,
      [guild.id, name, team_limit],
    );
    logger(`Created new team server **${name}** for ctf **${this.row.name}**`);
    const teamServer = new TeamServer(rows[0] as TeamServerRow);
    const infoChannel = await teamServer.makeChannel(guild.client, 'info');
    await teamServer.setInfoChannelSnowflake(infoChannel.id);
    await teamServer.setTeamCategorySnowflake((await teamServer.makeCategory(guild.client, 'Teams')).id);
    if (this.row.guild_snowflake === teamServer.row.guild_snowflake) {
      await infoChannel.setParent(this.row.info_category_snowflake);
    }
    return teamServer;
  }

  /* Team Server Retrieval */
  async fromNameTeamServer(name: string) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (rows.length === 0) throw new Error('no team server with that name in this ctf');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  async fromGuildSnowflakeTeamServer(guild_snowflake: string) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE guild_snowflake = $1 and ctf_id = ${this.row.id}`, [
      guild_snowflake,
    ]);
    if (rows.length === 0) throw new Error('no team server with that snowflake in this ctf');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  async getAllTeams() {
    let teams: Team[] = [];
    for (const teamServer of await this.getAllTeamServers()) {
      teams = teams.concat(await teamServer.getAllTeams());
    }
    return teams;
  }

  async printAllTeams() {
    const teams = await this.getAllTeams();
    return teams.length == 0
      ? `CTF **${this.row.name}** has no teams yet`
      : `CTF **${this.row.name}**'s teams are: **${teams.map((team) => team.row.name).join('**, **')}**`;
  }

  // Get either TeamServer or main ctf guild id and return the ctf

  static async fromTeamServerGuildSnowflakeTeamServer(guild_snowflake: string) {
    const { rows } = await query('SELECT * FROM team_servers WHERE guild_snowflake = $1', [guild_snowflake]);
    if (rows.length === 0) throw new Error('no team server with that snowflake');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  static async fromIdTeamServer(team_server_id: number) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE id = ${team_server_id}`);
    if (rows.length === 0) throw new Error('invalid team server id');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  async getAllTeamServers() {
    const { rows } = await query(`SELECT * FROM team_servers WHERE ctf_id = ${this.row.id}`);
    return rows.map((row) => new TeamServer(row as TeamServerRow));
  }

  async printAllTeamServers() {
    const teamServers = await this.getAllTeamServers();
    const printString =
      teamServers.length === 0
        ? `CTF **${this.row.name}** has no team servers`
        : `CTF **${this.row.name}**'s Team Servers are : **${teamServers
            .map((server) => server.row.name)
            .join('**, **')}**`;
    logger(printString);
    return printString;
  }

  /** User Creation */
  async createUser(member: GuildMember) {
    // Make sure there is a team server first BEFORE making the user
    // TODO: Determine how to handle a NoRoomError
    const teamServer = await this.getTeamServerWithSpace();

    // Add user to DB
    const { rows } = await query(`INSERT INTO users(ctf_id, user_snowflake) VALUES (${this.row.id}, $1) RETURNING *`, [
      member.user.id,
    ]);
    logger(`Added new user **${member.displayName}** to **${this.row.name}**`);
    let team: Team;

    // Try to give them their given team name initially, but if it fails then keep going through numbers until there's
    // one that isn't being used
    let nameAvailable = false;
    let iteration = 1;
    const teamName = `Team ${member.displayName}`;
    while (!nameAvailable) {
      try {
        team = await teamServer.makeTeam(member.client, this, `${teamName}${iteration > 1 ? ` ${iteration}` : ''}`);
        nameAvailable = true;
      } catch (e) {
        if (e instanceof DupeTeamError) {
          iteration++;
        } else {
          // Something bad happened so bubble up
          throw e;
        }
      }
    }

    // Give them their roles on main and team server (if they're somehow on it)
    let user: GuildMember;
    if (this.row.guild_snowflake !== teamServer.row.guild_snowflake) {
      user = member.client.guilds.resolve(teamServer.row.guild_snowflake).members.resolve(member.id);
      // If user falsy, they're not in team server
      if (user) {
        await user.roles.add(team.row.team_role_snowflake_team_server);
      }
    }
    user = member.client.guilds.resolve(this.row.guild_snowflake).members.resolve(member.id);
    // TODO: Edge case that user is false
    if (user) {
      await user.roles.add(team.row.team_role_snowflake_main);
    }

    return new User(rows[0] as UserRow);
  }

  /** User Retrieval */
  async fromUserSnowflakeUser(user_snowflake: string) {
    const { rows } = await query(`SELECT * FROM users WHERE user_snowflake = $1 and ctf_id = ${this.row.id}`, [
      user_snowflake,
    ]);
    if (rows.length === 0) throw new NoUserError();
    return new User(rows[0] as UserRow);
  }

  /** Misc Methods */
  static async fromGuildSnowflakeCTF(guild_id: string) {
    let ctf: CTF;
    try {
      // Try it as a TeamServer guild snowflake
      ctf = await CTF.fromIdCTF((await CTF.fromTeamServerGuildSnowflakeTeamServer(guild_id)).row.ctf_id);
    } catch {
      // Try it as a CTF guild snowflake
      ctf = await CTF.fromCTFGuildSnowflakeCTF(guild_id);
    }
    return ctf;
  }

  getGuild(client: Client): Guild {
    const guild = client.guilds.resolve(this.row.guild_snowflake);
    if (!guild) throw Error('No guild corresponds with the current CTF id');
    return guild;
  }

  throwErrorUnlessAdmin(interaction: CommandInteraction) {
    // if the admin role isn't set, no check is performed
    // otherwise, we need to check if the caller has admin
    if (!this.row.admin_role_snowflake) return;

    // if this was sent in the main guild, use the guild member
    // otherwise, we need to resolve the guild member in the main guild
    const member =
      this.row.guild_snowflake === interaction.guild.id
        ? interaction.member
        : this.getGuild(interaction.client).member(interaction.member.user);
    if (member?.roles.cache.has(this.row.admin_role_snowflake)) return;
    throw new Error('You do not have permission to use this command');
  }

  async makeRole(client: Client, name: string) {
    const ctfServerGuild = this.getGuild(client);
    if (ctfServerGuild.roles.cache.find((role) => role.name === name))
      throw new Error('Role with that name already exists');
    const role = await ctfServerGuild.roles.create({ data: { name: `${name}` } });
    logger(`Made new role **${name}** in CTF guild **${this.row.name}**`);
    return role;
  }

  async deleteRole(client: Client, role_snowflake: string) {
    const guild = this.getGuild(client);
    const roleToDelete = guild.roles.resolve(role_snowflake);
    if (roleToDelete) {
      await roleToDelete.delete();
      logger(
        `**${
          client.guilds.resolve(this.row.guild_snowflake).roles.resolve(role_snowflake).name
        }** role found: deleted that role`,
      );
      return;
    }
    logger(`**${role_snowflake}** role not found`);
  }

  async setRoleColor(client: Client, role_snowflake: string, color: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.resolve(role_snowflake);
    if (roleToChange) {
      await roleToChange.setColor(color);
      logger(
        `Changed **${
          client.guilds.resolve(this.row.guild_snowflake).roles.resolve(role_snowflake).name
        }**'s role to to color **${color}**`,
      );
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async setRoleName(client: Client, role_snowflake: string, new_name: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.resolve(role_snowflake);
    if (roleToChange) {
      await roleToChange.setName(new_name);
      logger(
        `Renamed the **${
          client.guilds.resolve(this.row.guild_snowflake).roles.resolve(role_snowflake).name
        }** role to to **${new_name}**`,
      );
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async getTeamServerWithSpace() {
    logger('Seeing what servers have space...');
    // eslint-disable-next-line
    const teamServer = (await this.getAllTeamServers()).find(async (server) => (await server.hasSpace(true)) === true);
    if (!teamServer) {
      throw new NoRoomError();
    }
    return teamServer;
  }

  async fromRoleTeam(team_role_snowflake: string) {
    const teamServers = await this.getAllTeamServers();
    let team: Team;
    // eslint-disable-next-line
    for (let server of teamServers) {
      try {
        // eslint-disable-next-line
        team = await server.fromRoleTeam(team_role_snowflake);
        return team;
      } catch {
        continue;
      }
    }
    throw new Error("that role doesn't belong to a team");
  }

  async fromUserTeam(user_snowflake: string) {
    const teamServers = await this.getAllTeamServers();
    let team: Team;
    const teamID = (await this.fromUserSnowflakeUser(user_snowflake)).row.team_id;
    for (const server of teamServers) {
      try {
        team = await server.fromIdTeam(teamID);
        return team;
      } catch {
        continue;
      }
    }
    throw new NoTeamUserError();
  }

  async fromChannelTeam(channel_snowflake: string) {
    const teamServers = await this.getAllTeamServers();
    let team: Team;
    // eslint-disable-next-line
    for (const server of teamServers) {
      try {
        // eslint-disable-next-line
        team = await server.fromChannelTeam(channel_snowflake);
        return team;
      } catch {
        // eslint-disable-next-line
        continue;
      }
    }
    throw new Error('no team associated with that channel');
  }

  async fromUnspecifiedTeam(user_snowflake: string, channel_snowflake: string) {
    try {
      return await this.fromChannelTeam(channel_snowflake);
    } catch {
      try {
        return await this.fromUserTeam(user_snowflake);
      } catch {
        throw new Error('no team can be found with the given info');
      }
    }
  }

  async makeChannelCategory(client: Client, name: string) {
    const guild = this.getGuild(client);
    let category = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'category');
    if (!category) {
      category = await guild.channels.create(`${name}`, { type: 'category' });
      logger(`**${name}** category not found: created **${name}** category`);
    } else {
      logger(`**${name}** category already found`);
    }
    return category;
  }

  async makeChannel(client: Client, name: string) {
    const guild = this.getGuild(client);
    let channel = guild.channels.cache.find((c) => c.name === `${name}` && c.type === 'text');
    if (channel) {
      await channel.delete();
      logger(`**${name}** channel found: deleted **${name}** channel`);
    }
    channel = await guild.channels.create(`${name}`, { type: 'text' });
    logger(`Created **${name}** channel`);
    return channel;
  }
}
