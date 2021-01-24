export const schema = `CREATE TABLE IF NOT EXISTS teams (
  id serial,
  team_role_snowflake text,
  text_channel_snowflake text,
  voice_channel_snowflake text,
  team_server_id integer REFERENCES team_servers ON DELETE SET NULL,
  name text,
  description text,
  color text,
  PRIMARY KEY( id )
);`;

export interface TeamsRow {
  id: number,
  team_role_snowflake: string,
  text_channel_snowflake: string,
  team_server_id: number,
  name: string,
  description: string | null,
  color: string | null
}
