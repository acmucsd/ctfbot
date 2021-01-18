const schemas = [
  `CREATE TABLE IF NOT EXISTS ctf (
    id serial,
    guild_snowflake text,
    name text,
    description text,
    start_date date,
    end_date date,
    admin_role text,
    announcements_channel_snowflake text,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS team_servers (
    id serial,
    guild_snowflake text,
    ctf_id integer,
    info_channel_snowflake text,
    team_category_snowflake text,
    name text,
    limit integer,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS users (
    id serial,
    user_snowflake text,
    team_id integer,
    tos_accepted boolean,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS invites (
    id serial,
    user_id integer,
    team_id integer,
    was_invited boolean,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS teams (
    id serial,
    team_role_snowflake text,
    text_channel_snowflake text,
    voice_channel_snowflake text,
    team_server_id integer,
    captain__user_id integer,
    name text,
    description text,
    color text,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS categories (
    id serial,
    ctf_id integer,
    name text,
    channel_category_snowflake text,
    description text,
    PRIMARY KEY( id )
  );`,
  'CREATE TYPE difficulty_level AS ENUM (\'baby\', \'easy\', \'medium\', \'hard\');',
  `CREATE TABLE IF NOT EXISTS challenges (
    id serial,
    category_id integer,
    channel_snowflake text,
    name text,
    author text,
    prompt text,
    difficulty difficulty_level,
    initial_points integer,
    point_decay integer,
    min_points integer,
    flag text,
    first_blood_id integer,
    publish_time date,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS attempts (
    id serial,
    challenge_id integer,
    user_id integer,
    attempted_flag text,
    successful boolean,
    timestamp date,
    PRIMARY KEY( id )
  );`,
  `CREATE TABLE IF NOT EXISTS attachments (
    id serial,
    challenge_id integer,
    name text,
    url text,
    PRIMARY KEY( id )
  );`,

];

export default schemas;
