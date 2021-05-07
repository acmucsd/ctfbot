export const schema = `CREATE TABLE IF NOT EXISTS ctfs (
    id serial,
    name text,
    description text,
    start_date timestamp,
    end_date timestamp,
    guild_snowflake text NOT NULL,
    admin_role_snowflake text,
    participant_role_snowflake text,
    announcements_channel_snowflake text,
    scoreboard_channel_snowflake text,
    tos_channel_snowflake text,
    tos_webhook_snowflake text,
    info_category_snowflake text,
    PRIMARY KEY( id )
  );`;

export interface CTFRow {
  id: number;
  name: string;
  description: string | null;
  start_date: Date | null;
  end_date: Date | null;
  guild_snowflake: string;
  admin_role_snowflake: string | null;
  participant_role_snowflake: string | null;
  announcements_channel_snowflake: string | null;
  scoreboard_channel_snowflake: string | null;
  tos_channel_snowflake: string | null;
  tos_webhook_snowflake: string | null;
  info_category_snowflake: string | null;
}
