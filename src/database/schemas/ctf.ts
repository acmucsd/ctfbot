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

export interface CTFRow {
  id: number,
  name: string,
  description: string | null,
  start_date: Date | null,
  end_date: Date | null,
  guild_snowflake: string,
  admin_role_snowflake: string | null,
  announcements_channel_snowflake: string | null
}
