import query from '../database';
import { AttachmentsRow } from '../schemas/attachments';

export default class Attachments {
  row: AttachmentsRow;

  constructor(row: AttachmentsRow) {
    this.row = row;
  }

  async setChallengeID(challenge_id: number) {
    await query(`UPDATE attachments SET challenge_id = $1 WHERE id = ${this.row.id}`, [challenge_id]);
    this.row.challenge_id = challenge_id;
  }

  async setName(name: string) {
    await query(`UPDATE attachments SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setURL(url: string) {
    await query(`UPDATE attachments SET url = $1 WHERE id = ${this.row.id}`, [url]);
    this.row.url = url;
  }

  async deleteAttachment() {
    await query(`DELETE FROM attachmets WHERE id = ${this.row.id}`);
  }

  static async fromID(id: number) {
    const { rows } = await query(`SELECT * FROM attachments WHERE id = ${id}`);
    return new Attachments(rows[0] as AttachmentsRow);
  }

  static async fromName(name: string) {
    const { rows } = await query('SELECT * FROM attachments WHERE name = $1', [name]);
    return new Attachments(rows[0] as AttachmentsRow);
  }

  static async createAttachment(name: string, url: string) {
    // check if a challenge already exists with that name
    const { rows: existingRows } = await query('SELECT id FROM attachments WHERE name = $1', [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create an attachment with a duplicate name');

    const { rows } = await query('INSERT INTO attachments(name, url) VALUES ($1, $2) RETURNING *', [name, url]);
    return new Attachments(rows[0] as AttachmentsRow);
  }
}
