import { Attempt, Invite } from '.';
import { AttemptRow, InviteRow, UserRow } from '../schemas';
import query from '../database';

export default class User {
  row: UserRow;

  constructor(row: UserRow) {
    this.row = row;
  }

  /** User Creation / Deletion */
  // makeUser made in Team

  async deleteUser() {
    await query(`DELETE FROM users WHERE id = ${this.row.id}`);
  }

  /** User Setters */
  // Unique per CTF
  async setUserSnowflake(user_snowflake: string) {
    await query(`UPDATE users SET user_snowflake = $1 WHERE id = ${this.row.id}`, [user_snowflake]);
    this.row.user_snowflake = user_snowflake;
  }

  async setTeamID(team_id: number) {
    await query(`UPDATE users SET team_id = $1 WHERE id = ${this.row.id}`, [team_id]);
    this.row.team_id = team_id;
  }

  async setTOS(tos_accepted: boolean) {
    await query(`UPDATE users SET tos_accepted = $1 WHERE id = ${this.row.id}`, [tos_accepted]);
    this.row.tos_accepted = tos_accepted;
  }

  /** Invite Creation */
  async createInvite(team_id: number) {
    const { rows: existingRows } = await query(
      `SELECT id FROM invites WHERE team_id = $1 and user_id = ${this.row.id}`,
      [team_id],
    );
    if (existingRows && existingRows.length > 0) throw new Error('invite already exists');

    const {
      rows,
    } = await query(
      `INSERT INTO invites(user_id, team_id, was_invited) VALUES (${this.row.id}, $1, false) RETURNING *`,
      [team_id],
    );
    return new Invite(rows[0] as InviteRow);
  }

  /** Invite Retrieval */
  async fromTeamIDInvite(team_id: number) {
    const { rows } = await query(`SELECT * FROM invites WHERE user_id = ${this.row.id} and team_id = $1`, [team_id]);
    if (rows.length === 0) throw new Error('no invite for that team');
    return new Invite(rows[0] as InviteRow);
  }

  /** Attempt Creation */
  async createAttempt(challenge_id: number, attempted_flag: string, successful: boolean, timestamp: Date) {
    const {
      rows,
    } = await query(
      `INSERT INTO attempts(challenge_id, user_id, attempted_flag, successful, timestamp) VALUES ($1, ${this.row.id}, $2, $3, $4) RETURNING *`,
      [challenge_id, attempted_flag, successful, timestamp],
    );
    return new Attempt(rows[0] as AttemptRow);
  }

  /** Attempt Retrieval */
  async getAllAttempts() {
    const { rows } = await query(`SELECT * FROM attempts WHERE user_id = ${this.row.id}`);
    return rows.map((row) => new Attempt(row as AttemptRow));
  }
}
