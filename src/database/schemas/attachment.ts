export const schema = `CREATE TABLE IF NOT EXISTS attachments (
  id serial,
  challenge_id integer REFERENCES challenges ON DELETE CASCADE,
  name text,
  url text,
  PRIMARY KEY( id )
);`;

export interface AttachmentRow {
  id: number,
  challenge_id: number,
  name: string,
  url: string
}
