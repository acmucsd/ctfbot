export const schema = `CREATE TABLE IF NOT EXISTS team_servers (
    id serial,
    guild_snowflake text,
    ctf_id integer REFERENCES ctfs,
    info_channel_snowflake text,
    team_category_snowflake text,
    name text,
    limit integer,
    PRIMARY KEY( id )
  );`;

export interface TeamServerRow {
  id: number,
  guild_snowflake: string,
  ctf_id: number,
  info_channel_snowflake: string,
  team_category_snowflake: string,
  name: string,
  limit: string
}
