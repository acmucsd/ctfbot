export default [
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
];
