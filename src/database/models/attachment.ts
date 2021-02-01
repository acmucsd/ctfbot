import query from '../database';
import { AttachmentRow } from '../schemas/attachment';

export default class Attachment {
  row: AttachmentRow;

  constructor(row: AttachmentRow) {
    this.row = row;
  }

  // makeAttachment made in Challenge

  // Needed?
  async setChallengeID(challenge_id: number) {
    await query(`UPDATE attachments SET challenge_id = $1 WHERE id = ${this.row.id}`, [challenge_id]);
    this.row.challenge_id = challenge_id;
  }

  // Unique per Challenge
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
    return new Attachment(rows[0] as AttachmentRow);
  }

  static async fromChallengeByName(name: string) {
    const { rows } = await query('SELECT * FROM attachments WHERE name = $1', [name]);
    return new Attachment(rows[0] as AttachmentRow);
  }
}
