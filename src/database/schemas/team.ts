export const schema = `CREATE TABLE IF NOT EXISTS teams (
  id serial,
  team_role_snowflake_main text,
  team_role_snowflake_team_server text,
  text_channel_snowflake text,
  voice_channel_snowflake text,
  team_server_id integer REFERENCES team_servers ON DELETE SET NULL,
  name text,
  description text,
  color text,
  PRIMARY KEY( id )
);`;

// no captain user yet due to an initialization error
// captain_user_id integer REFERENCES users,

export interface TeamRow {
  id: number,
  team_role_snowflake_main: string | null,
  team_role_snowflake_team_server: string | null,
  text_channel_snowflake: string | null,
  team_server_id: number,
  name: string,
  description: string | null,
  color: string | null,
  captain_user_id: number | null
}
