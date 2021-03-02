export const schema = `CREATE TABLE IF NOT EXISTS team_servers (
    id serial,
    guild_snowflake text,
    ctf_id integer REFERENCES ctfs ON DELETE CASCADE,
    info_channel_snowflake text,
    team_category_snowflake text,
    name text,
    team_limit integer,
    PRIMARY KEY( id )
  );`;

export interface TeamServerRow {
  id: number;
  guild_snowflake: string;
  ctf_id: number;
  info_channel_snowflake: string | null;
  team_category_snowflake: string | null;
  name: string;
  team_limit: number;
}
