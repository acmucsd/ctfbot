export const schema = `CREATE TABLE IF NOT EXISTS invites (
  id serial,
  user_id integer REFERENCES users ON DELETE CASCADE,
  team_id integer REFERENCES teams ON DELETE CASCADE,
  message_snowflake text,
  was_invited boolean,
  accepted boolean DEFAULT false,
  PRIMARY KEY( id )
);`;

export interface InviteRow {
  id: number;
  user_id: number;
  team_id: number;
  message_snowflake: string;
  was_invited: boolean;
  accepted: boolean;
}
