export const schema = `CREATE TABLE IF NOT EXISTS users (
  id serial,
  user_snowflake text,
  team_id integer REFERENCES teams ON DELETE SET NULL,
  tos_accepted boolean,
  PRIMARY KEY( id )
);`;

export interface UserRow {
  id: number,
  user_snowflake: string,
  team_id: string,
  tos_accepted: boolean
}
