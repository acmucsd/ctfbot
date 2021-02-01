import query from '../database';
import { InviteRow } from '../schemas/invite';

export default class Invite {
  row: InviteRow;

  constructor(row: InviteRow) {
    this.row = row;
  }

  // makeInvite made in Team

  async setWasInvited(was_invited: boolean) {
    await query(`UPDATE invites SET was_invited = $1 WHERE id = ${this.row.id}`, [was_invited]);
    this.row.was_invited = was_invited;
  }

  async deleteInvite() {
    await query(`DELETE FROM invites WHERE id = ${this.row.id}`);
  }
}
