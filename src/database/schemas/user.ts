export const schema = `CREATE TABLE IF NOT EXISTS users (
  id serial,
  ctf_id integer REFERENCES ctfs ON DELETE CASCADE,
  user_snowflake text,
  team_id integer REFERENCES teams ON DELETE SET NULL,
  PRIMARY KEY( id )
);`;

export interface UserRow {
  id: number;
  ctf_id: number;
  user_snowflake: string;
  team_id: number;
}
