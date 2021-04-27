import query from '../database';
import { AttachmentRow } from '../schemas/attachment';

export default class Attachment {
  row: AttachmentRow;

  constructor(row: AttachmentRow) {
    this.row = row;
  }

  /** Attachment Creation */
  // makeAttachment made in Challenge

  async deleteAttachment() {
    await query(`DELETE FROM attachments WHERE id = ${this.row.id}`);
  }

  /** Attachment Setters */
  // Needed?
  async setChallengeID(challenge_id: number) {
    await query(
      `UPDATE attachments SET challenge_id = $1 WHERE id = ${this.row.id}`,
      [challenge_id],
    );
    this.row.challenge_id = challenge_id;
  }

  // Unique per Challenge
  async setName(name: string) {
    await query(`UPDATE attachments SET name = $1 WHERE id = ${this.row.id}`, [
      name,
    ]);
    this.row.name = name;
  }

  async setURL(url: string) {
    await query(`UPDATE attachments SET url = $1 WHERE id = ${this.row.id}`, [
      url,
    ]);
    this.row.url = url;
  }
}
