import { Attempt, Invite, Team } from '.';
import { AttemptRow, InviteRow, TeamRow, UserRow } from '../schemas';
import query from '../database';
import { Client } from 'discord.js';

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

  async setTeamID(team_id: number) {
    await query(`UPDATE users SET team_id = $1 WHERE id = ${this.row.id}`, [team_id]);
    this.row.team_id = team_id;
  }

  /** Invite Creation */
  async createInvite(client: Client, team: Team) {
    const { rows: existingRows } = await query(
      `SELECT id FROM invites WHERE team_id = $1 and user_id = ${this.row.id}`,
      [team.row.id],
    );
    if (existingRows && existingRows.length > 0) throw new Error('invite for that user already exists');

    // create invite
    const {
      rows,
    } = await query(
      `INSERT INTO invites(user_id, team_id, was_invited) VALUES (${this.row.id}, $1, true) RETURNING *`,
      [team.row.id],
    );
    const invite = new Invite(rows[0] as InviteRow);

    // send to chat
    await invite.sendInviteMessage(client, this, team);

    return invite;
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

    const attempt = new Attempt(rows[0] as AttemptRow);

    // TODO
    // notify for first blood

    return attempt;
  }

  /** Attempt Retrieval */
  async getAllAttempts() {
    const { rows } = await query(`SELECT * FROM attempts WHERE user_id = ${this.row.id}`);
    return rows.map((row) => new Attempt(row as AttemptRow));
  }

  // get team
  async getTeam() {
    const { rows } = await query(`SELECT * FROM teams WHERE id = ${this.row.team_id}`);
    if (rows.length === 0) throw new Error('no team for this user (ILLEGAL STATE)');
    return new Team(rows[0] as TeamRow);
  }

  // returns true if this user is the only person on their team
  async isAlone() {
    const { rows } = await query(`SELECT COUNT(*) FROM users WHERE team_id = ${this.row.team_id}`);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return rows && rows[0].count && rows[0].count === '1';
  }

  static async fromID(id: number): Promise<User> {
    const { rows } = await query(`SELECT * FROM users WHERE id = ${id}`);
    if (rows.length === 0) throw new Error('no user with that ID found (ILLEGAL STATE)');
    return new User(rows[0] as UserRow);
  }
}
