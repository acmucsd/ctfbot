export const schema = `CREATE TABLE IF NOT EXISTS challenge_channels (
    id serial,
    challenge_id integer REFERENCES challenges ON DELETE CASCADE NOT NULL,
    teamserver_id integer REFERENCES team_servers ON DELETE CASCADE NOT NULL,
    channel_snowflake text,
    webhook_snowflake text,
    PRIMARY KEY( id )
  );`;

export interface ChallengeChannelRow {
  id: number;
  challenge_id: number;
  teamserver_id: number;
  channel_snowflake: string;
  webhook_snowflake: string;
}
