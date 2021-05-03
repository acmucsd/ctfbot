export const schema = `CREATE TABLE IF NOT EXISTS category_channels (
    id serial,
    category_id integer REFERENCES categories ON DELETE CASCADE NOT NULL,
    teamserver_id integer REFERENCES team_servers ON DELETE CASCADE NOT NULL,
    channel_snowflake text,
    PRIMARY KEY( id )
  );`;

export interface CategoryChannelRow {
  id: number;
  category_id: number;
  teamserver_id: number;
  channel_snowflake: string;
}
