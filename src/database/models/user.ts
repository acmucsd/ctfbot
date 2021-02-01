import query from '../database';
import { AttemptRow } from '../schemas/attempt';
import { UserRow } from '../schemas/user';
import Attempt from './attempt';

export default class User {
  row: UserRow;

  constructor(row: UserRow) {
    this.row = row;
  }

  // makeUser made in Team(?)

  // Unique per CTF
  async setUserSnowflake(user_snowflake: string) {
    await query(`UPDATE users SET user_snowflake = $1 WHERE id = ${this.row.id}`, [user_snowflake]);
    this.row.user_snowflake = user_snowflake;
  }

  async setTeamID(team_id: string) {
    await query(`UPDATE users SET team_id = $1 WHERE id = ${this.row.id}`, [team_id]);
    this.row.team_id = team_id;
  }

  async setTOS(tos_accepted: boolean) {
    await query(`UPDATE users SET tos_accepted = $1 WHERE id = ${this.row.id}`, [tos_accepted]);
    this.row.tos_accepted = tos_accepted;
  }

  async createAttempt(challenge_id: number, attempted_flag: string, successful: boolean, timestamp: Date) {
    const { rows } = await query(`INSERT INTO attempts(challenge_id, user_id, attempted_flag, successful, timestamp) VALUES ($1, ${this.row.id}, $2, $3, $4) RETURNING *`, [challenge_id, attempted_flag, successful, timestamp]);
    return new Attempt(rows[0] as AttemptRow);
  }

  async deleteUser() {
    await query(`DELETE FROM users WHERE id = ${this.row.id}`);
  }
}
