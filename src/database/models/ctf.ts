import query from '../database';
import { CategoryRow } from '../schemas/category';
import { CTFRow } from '../schemas/ctf';
import { TeamServerRow } from '../schemas/teamserver';
import { UserRow } from '../schemas/user';
import Category from './category';
import TeamServer from './teamserver';
import User from './user';

export default class CTF {
  row: CTFRow;

  constructor(row: CTFRow) {
    this.row = row;
  }

  /* CTF Creation / Deletion */
  static async createCTF(name: string, guildSnowflake: string) {
    // check if a CTF already exists in this guild
    const { rows: existingRows } = await query('SELECT id FROM ctfs WHERE guild_snowflake = $1', [guildSnowflake]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a second CTF in this guild');

    const { rows } = await query('INSERT INTO ctfs(name, guild_snowflake) VALUES ($1, $2) RETURNING *', [name, guildSnowflake]);
    return new CTF(rows[0] as CTFRow);
  }

  async deleteCTF() {
    // because of Foreign Key constraints, deletes all associated Team Servers, Teams, Categories, and Challenges
    await query(`DELETE FROM ctfs WHERE id = ${this.row.id}`);
  }

  /* CTF Retrieval */
  static async fromNameCTF(name: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE name = $1', [name]);
    if (rows.length === 0) throw new Error('no ctf associated with that name');
    return new CTF(rows[0] as CTFRow);
  }

  static async fromGuildSnowflakeCTF(guild_snowflake: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE guild_snowflake = $1', [guild_snowflake]);
    if (rows.length === 0) throw new Error('no ctf associated with this guild');
    return new CTF(rows[0] as CTFRow);
  }

  /* CTF Setters */
  // Unique among CTFs
  async setName(name: string) {
    await query(`UPDATE ctfs SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE ctfs SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
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
    await query(`UPDATE ctfs SET announcements_channel_snowflake = $1 WHERE id = ${this.row.id}`, [announcementsChannelSnowflake]);
    this.row.announcements_channel_snowflake = announcementsChannelSnowflake;
  }

  /* Category Creation */
  async createCategory(name: string) {
    // check if a category already exists with that name in this ctf
    const { rows: existingRows } = await query(`SELECT id FROM categories WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a category with a duplicate name in this ctf');

    const { rows } = await query(`INSERT INTO categories(ctf_id, name) VALUES (${this.row.id}, $1) RETURNING *`, [name]);
    return new Category(rows[0] as CategoryRow);
  }

  /* Category Retrieval */
  async fromNameCategory(name: string) {
    const { rows } = await query(`SELECT * FROM categories WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (rows.length === 0) throw new Error('no category with that name in this ctf');
    return new Category(rows[0] as CategoryRow);
  }

  async fromChannelCategorySnowflakeCategory(channel_category_snowflake: string) {
    const { rows } = await query(`SELECT * FROM categories WHERE channel_category_snowflake = $1 and ctf_id = ${this.row.id}`, [channel_category_snowflake]);
    if (rows.length === 0) throw new Error('no category with that snowflake in this ctf');
    return new Category(rows[0] as CategoryRow);
  }

  async getAllCategories() {
    const { rows } = await query(`SELECT * FROM categories WHERE ctf_id = ${this.row.id}`);
    return rows.map((row) => new Category(row as CategoryRow));
  }

  /* Team Server Creation */
  async createTeamServer(guild_snowflake: string, name: string, team_limit: number) {
    const { rows: existingRows } = await query(`SELECT id FROM team_servers WHERE ctf_id = ${this.row.id} and name = $1`, [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a team server with a duplicate name in this ctf');

    const { rows: existingRows2 } = await query('SELECT id FROM team_servers WHERE guild_snowflake = $1', [guild_snowflake]);
    if (existingRows2 && existingRows2.length > 0) throw new Error('guilds are limited to a single teamserver');

    // Do a check to see if anything is using the team_category_snowflake or info_channel_snowflake?

    const { rows } = await query(`INSERT INTO team_servers(guild_snowflake, ctf_id, info_channel_snowflake, team_category_snowflake, name, team_limit) VALUES ($1, ${this.row.id}, $2, $3, $4, $5) RETURNING *`, [guild_snowflake, name, team_limit]);
    return new TeamServer(rows[0] as TeamServerRow);
  }

  /* Team Server Retrieval */
  async fromNameTeamServer(name: string) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE name = $1 and ctf_id = ${this.row.id}`, [name]);
    if (rows.length === 0) throw new Error('no team server with that name in this ctf');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  async fromGuildSnowflakeTeamServer(guild_snowflake: string) {
    const { rows } = await query(`SELECT * FROM team_servers WHERE guild_snowflake = $1 and ctf_id = ${this.row.id}`, [guild_snowflake]);
    if (rows.length === 0) throw new Error('no team server with that snowflake in this ctf');
    return new TeamServer(rows[0] as TeamServerRow);
  }

  async getAllTeamServers() {
    const { rows } = await query(`SELECT * FROM team_servers WHERE ctf_id = ${this.row.id}`);
    return rows.map((row) => new TeamServer(row as TeamServerRow));
  }

  /** User Creation */
  async makeUser(user_snowflake: string) {
    // Check

    const { rows } = await query(`INSERT INTO users(ctf_id, user_snowflake, tos_accepted) VALUES (${this.row.id}, $2, false) RETURNING *`, [user_snowflake]);
    return new User(rows[0] as UserRow);
  }

  /** User Retrieval */
  async fromUserSnowflakeUser(user_snowflake: string) {
    const { rows } = await query(`SELECT * FROM users WHERE user_snowflake = $1 and ctf_id = ${this.row.id}`, [user_snowflake]);
    if (rows.length === 0) throw new Error('that user is not in this ctf');
    return new User(rows[0] as UserRow);
  }
}
