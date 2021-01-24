import { Pool } from 'pg';
import { schema as ctfSchema } from './ctf';
import { schema as teamServerSchema } from './teamserver';

// add schemas to this as we go
const schemas = [
  ctfSchema,
  teamServerSchema,
  `CREATE TABLE IF NOT EXISTS teams (
    id serial,
    team_role_snowflake text,
    text_channel_snowflake text,
    voice_channel_snowflake text,
    team_server_id integer REFERENCES team_servers ON DELETE SET NULL,
    name text,
    description text,
    color text,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id serial,
    user_snowflake text,
    team_id integer REFERENCES teams ON DELETE SET NULL,
    tos_accepted boolean,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS invites (
    id serial,
    user_id integer REFERENCES users ON DELETE CASCADE,
    team_id integer REFERENCES teams ON DELETE CASCADE,
    was_invited boolean,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS categories (
    id serial,
    ctf_id integer REFERENCES ctfs ON DELETE CASCADE,
    name text,
    channel_category_snowflake text,
    description text,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS challenges (
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
  );`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id serial,
    challenge_id integer REFERENCES challenges ON DELETE CASCADE,
    user_id integer REFERENCES users ON DELETE CASCADE,
    attempted_flag text,
    successful boolean,
    timestamp date,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS attachments (
    id serial,
    challenge_id integer REFERENCES challenges ON DELETE CASCADE,
    name text,
    url text,
    PRIMARY KEY( id )
  );`];

// janky code that waits for each table to initialize before declaring the next one
export default async (pool: Pool) => {
  await schemas.reduce(async (promise, schema) => {
    await promise;
    await pool.query(schema);
  }, Promise.resolve());
};
