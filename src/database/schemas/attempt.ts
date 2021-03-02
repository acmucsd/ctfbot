export const schema = `CREATE TABLE IF NOT EXISTS attempts (
  id serial,
  challenge_id integer REFERENCES challenges ON DELETE CASCADE,
  user_id integer REFERENCES users ON DELETE CASCADE,
  attempted_flag text,
  successful boolean,
  timestamp date,
  PRIMARY KEY( id )
);`;

export interface AttemptRow {
  id: number;
  challenge_id: number;
  user_id: number;
  attempted_flag: string;
  successful: boolean;
  timestamp: Date;
}
