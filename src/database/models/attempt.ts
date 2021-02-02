import query from '../database';
import { AttemptRow } from '../schemas/attempt';

export default class Attempt {
  row: AttemptRow;

  constructor(row: AttemptRow) {
    this.row = row;
  }

  async deleteAttempt() {
    await query(`DELETE FROM attempts WHERE id = ${this.row.id}`);
  }
}
