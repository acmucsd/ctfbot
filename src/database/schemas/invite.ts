export const schema = `CREATE TABLE IF NOT EXISTS invites (
  id serial,
  user_id integer REFERENCES users ON DELETE CASCADE,
  team_id integer REFERENCES teams ON DELETE CASCADE,
  was_invited boolean,
  PRIMARY KEY( id )
);`;

export interface InviteRow {
  id: number;
  user_id: number;
  team_id: number;
  was_invited: boolean;
}
