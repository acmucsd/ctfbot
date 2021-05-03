export const schema = `CREATE TABLE IF NOT EXISTS categories (
  id serial,
  ctf_id integer REFERENCES ctfs ON DELETE CASCADE,
  name text,
  description text,
  PRIMARY KEY( id )
);`;

export interface CategoryRow {
  id: number;
  ctf_id: number;
  name: string;
  description: string | null;
}
