export const schema = `CREATE TABLE IF NOT EXISTS challenges (
  id serial,
  category_id integer REFERENCES categories ON DELETE CASCADE,
  channel_snowflake text,
  name text,
  author text,
  prompt text,
  difficulty text,
  initial_points integer,
  point_decay integer,
  min_points integer,
  flag text,
  first_blood_id integer REFERENCES users ON DELETE SET NULL,
  publish_time date,
  PRIMARY KEY( id )
);`;

export interface ChallengeRow {
  id: number;
  category_id: number;
  channel_snowflake: string | null;
  name: string;
  author: string | null;
  prompt: string | null;
  difficulty: string | null;
  initial_points: number | null;
  point_decay: number | null;
  min_points: number | null;
  flag: string | null;
  first_blood_id: number | null;
  publish_time: Date | null;
}
