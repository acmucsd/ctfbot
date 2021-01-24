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

export interface ChallengesRow {
  id: number,
  category_id: number,
  channel_snowflake: string,
  name: string,
  author: string,
  prompt: string,
  difficulty: string,
  initial_points: number,
  point_decay: number,
  min_points: number,
  flag: string,
  first_blood_id: number,
  publish_time: Date
}
