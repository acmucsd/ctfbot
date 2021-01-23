import query from '../database';

export const schema = `CREATE TABLE IF NOT EXISTS ctfs (
    id serial,
    name text,
    description text,
    start_date date,
    end_date date,
    guild_snowflake text,
    admin_role_snowflake text,
    announcements_channel_snowflake text,
    PRIMARY KEY( id )
  );`;

interface CTFRow {
  id: number,
  name: string,
  description: string | null,
  start_date: Date | null,
  end_date: Date | null,
  guild_snowflake: string,
  admin_role_snowflake: string | null,
  announcements_channel_snowflake: string | null
}

class CTF {
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

  async setGuildSnowflake(guildSnowflake: string) {
    await query(`UPDATE ctfs SET guild_snowflake = $1 WHERE id = ${this.row.id}`, [guildSnowflake]);
    this.row.guild_snowflake = guildSnowflake;
  }

  async setAdminRoleSnowflake(adminRoleSnowflake: string) {
    await query(`UPDATE ctfs SET admin_role_snowflake = $1 WHERE id = ${this.row.id}`, [adminRoleSnowflake]);
    this.row.admin_role_snowflake = adminRoleSnowflake;
  }

  async setAnnouncementsChannelSnowflake(announcementsChannelSnowflake: string) {
    await query(`UPDATE ctfs SET announcements_channel_snowflake = $1 WHERE id = ${this.row.id}`, [announcementsChannelSnowflake]);
    this.row.announcements_channel_snowflake = announcementsChannelSnowflake;
  }
}

export async function fromID(id: number) {
  const { rows } = await query(`SELECT * FROM ctfs WHERE id = ${id}`);
  return new CTF(rows[0] as CTFRow);
}

export async function fromName(name: string) {
  const { rows } = await query('SELECT * FROM ctfs WHERE name = $1', [name]);
  return new CTF(rows[0] as CTFRow);
}
