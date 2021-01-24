import query from '../database';
import { CTFRow } from '../schemas/ctf';

export default class CTF {
  row: CTFRow;

  constructor(row: CTFRow) {
    this.row = row;
  }

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

  async setAdminRoleSnowflake(adminRoleSnowflake: string) {
    await query(`UPDATE ctfs SET admin_role_snowflake = $1 WHERE id = ${this.row.id}`, [adminRoleSnowflake]);
    this.row.admin_role_snowflake = adminRoleSnowflake;
  }

  async setAnnouncementsChannelSnowflake(announcementsChannelSnowflake: string) {
    await query(`UPDATE ctfs SET announcements_channel_snowflake = $1 WHERE id = ${this.row.id}`, [announcementsChannelSnowflake]);
    this.row.announcements_channel_snowflake = announcementsChannelSnowflake;
  }

  async deleteCTF() {
    // because of Foreign Key constraints, deletes all associated Team Servers, Teams, Categories, and Challenges
    await query(`DELETE FROM ctfs WHERE id = ${this.row.id}`);
  }

  // builders
  static async fromID(id: number) {
    const { rows } = await query(`SELECT * FROM ctfs WHERE id = ${id}`);
    return new CTF(rows[0] as CTFRow);
  }

  static async fromName(name: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE name = $1', [name]);
    return new CTF(rows[0] as CTFRow);
  }

  static async fromGuildSnowflake(guild_snowflake: string) {
    const { rows } = await query('SELECT * FROM ctfs WHERE guild_snowflake = $1', [guild_snowflake]);
    return new CTF(rows[0] as CTFRow);
  }

  // create a new CTF
  static async createCTF(name: string, guildSnowflake: string) {
    // check if a CTF already exists in this guild
    const { rows: existingRows } = await query('SELECT id FROM ctfs WHERE guild_snowflake = $1', [guildSnowflake]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a second CTF in this guild');

    const { rows } = await query('INSERT INTO ctfs(name, guild_snowflake) VALUES ($1, $2) RETURNING *', [name, guildSnowflake]);
    return new CTF(rows[0] as CTFRow);
  }
}
