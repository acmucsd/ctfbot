export const schema = `CREATE TABLE IF NOT EXISTS categories (
  id serial,
  ctf_id integer REFERENCES ctfs ON DELETE CASCADE,
  name text,
  channel_category_snowflake text,
  description text,
  PRIMARY KEY( id )
);`;

export interface CategoriesRow {
  id: number,
  ctf_id: number,
  name: string,
  channel_category_snowflake: string,
  description: string
}
