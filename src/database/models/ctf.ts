import { Client, Guild } from 'discord.js';
import { Category, Team, TeamServer, User } from '.';
import { CategoryRow, CTFRow, TeamServerRow, UserRow } from '../schemas';
import query from '../database';
import { logger } from '../../log';
import CommandInteraction from '../../events/interaction/compat/CommandInteraction';

export default class CTF {
  row: CTFRow;

  constructor(row: CTFRow) {
    this.row = row;
  }

  /* CTF Creation / Deletion */
  static async createCTF(name: string, guildSnowflake: string) {
    // check if a CTF already exists in this guild
    const { rows: existingCTFs } = await query('SELECT id FROM ctfs WHERE guild_snowflake = $1', [guildSnowflake]);
    if (existingCTFs && existingCTFs.length > 0) throw new Error('cannot create a second CTF in this guild');

    const { rows: existingNames } = await query('SELECT id FROM ctfs WHERE name = $1', [name]);
    if (existingNames && existingNames.length > 0) throw new Error('cannot create ctf with a duplicate name');

    const { rows } = await query('INSERT INTO ctfs(name, guild_snowflake) VALUES ($1, $2) RETURNING *', [
      name,
      guildSnowflake,
    ]);
    logger(`Created new ctf "${name}"`);
    return new CTF(rows[0] as CTFRow);
  }

  async deleteCTF() {
    // because of Foreign Key constraints, deletes all associated Team Servers, Teams, Categories, and Challenges
    await query(`DELETE FROM ctfs WHERE id = ${this.row.id}`);
    logger(`Deleted ctf "${this.row.name}"`);
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
    logger(`Created new team server "${name}" for ctf "${this.row.name}"`);
    const teamServer = new TeamServer(rows[0] as TeamServerRow);
    await teamServer.setInfoChannelSnowflake((await teamServer.makeChannel(guild.client, 'info')).id);
    await teamServer.setTeamCategorySnowflake((await teamServer.makeCategory(guild.client, 'Teams')).id);
    return teamServer;
  }

  /* Team Server Retrieval */
  async fromNameTeamServer(name: string) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (rows.length === 0) throw new Error('no team server with that name in this ctf');
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
    const printString =
      teams.length == 0
        ? `CTF **${this.row.name}** has no teams yet`
        : `CTF **${this.row.name}**'s teams are: **${teams.map((team) => team.row.name).join('**, **')}**`;
    return printString;
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
  async createUser(user_snowflake: string) {
    // Check

    const {
      rows,
    } = await query(
      `INSERT INTO users(ctf_id, user_snowflake, tos_accepted) VALUES (${this.row.id}, $2, false) RETURNING *`,
      [user_snowflake],
    );
    return new User(rows[0] as UserRow);
  }

  /** User Retrieval */
  async fromUserSnowflakeUser(user_snowflake: string) {
    const { rows } = await query(`SELECT * FROM users WHERE user_snowflake = $1 and ctf_id = ${this.row.id}`, [
      user_snowflake,
    ]);
    if (rows.length === 0) throw new Error('that user is not in this ctf');
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

  /**
   * Broken
   */
  throwErrorUnlessAdmin(interaction: CommandInteraction) {
    // if the admin role isn't set, no check is performed
    // otherwise, we need to check if the caller has admin
    if (!this.row.admin_role_snowflake) return;

    // if this was sent in the main guild, use the guild member
    // otherwise, we need to resolve the guild member in the main guild
    const member =
      this.row.guild_snowflake === interaction.guild.id
        ? interaction.member
        : this.getGuild(interaction.client).member(interaction.member.user); //.member(interaction.member.user);
    if (member?.roles.cache.has(this.row.admin_role_snowflake)) return;
    throw new Error('You do not have permission to use this command');
  }

  async makeRole(client: Client, name: string) {
    const ctfServerGuild = this.getGuild(client);
    if (ctfServerGuild.roles.cache.find((role) => role.name === name))
      throw new Error('Role with that name already exists');
    const role = await ctfServerGuild.roles.create({ data: { name: `${name}` } });
    logger(`Made new role "${name}" in CTF guild "${this.row.name}"`);
    return role;
  }

  async deleteRole(client: Client, role_snowflake: string) {
    const guild = this.getGuild(client);
    const roleToDelete = guild.roles.resolve(role_snowflake);
    if (roleToDelete) {
      await roleToDelete.delete();
      logger(`Role with ${role_snowflake} found: deleted that role`);
      return;
    }
    logger(`Role with ${role_snowflake} not found`);
  }

  async setRoleColor(client: Client, role_snowflake: string, color: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.resolve(role_snowflake);
    if (roleToChange) {
      await roleToChange.setColor(color);
      logger(`Changed role with snowflake **${role_snowflake}** to color **${color}**`);
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async setRoleName(client: Client, role_snowflake: string, new_name: string) {
    const guild = this.getGuild(client);
    const roleToChange = guild.roles.resolve(role_snowflake);
    if (roleToChange) {
      await roleToChange.setName(new_name);
      logger(`Renamed role with snowflake **${role_snowflake}** to **${new_name}**`);
    } else {
      throw new Error('role not found in ctf');
    }
  }

  async getTeamServerWithSpace() {
    logger('Seeing what servers have space...');
    // eslint-disable-next-line
    const teamServer = (await this.getAllTeamServers()).find(async (server) => (await server.hasSpace()) === true);
    if (!teamServer) {
      throw new Error('all team servers are full');
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
    // eslint-disable-next-line
    for (const server of teamServers) {
      // eslint-disable-next-line
      try {
        // eslint-disable-next-line
        team = await server.fromIdTeam(teamID);
        return team;
      } catch {
        // eslint-disable-next-line
        continue;
      }
    }
    throw new Error('no team associated with that user');
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
    throw new Error('no team asociated with that channel');
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
}
