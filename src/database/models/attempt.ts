import query from '../database';
import { AttemptRow } from '../schemas/attempt';

export default class Attempt {
  row: AttemptRow;

  constructor(row: AttemptRow) {
    this.row = row;
  }

  // makeAttempt made in User

  static async retrieveAllAttemptsByUser(user_id: number) {
    const { rows } = await query('SELECT * FROM attempts WHERE user_id = $1', [user_id]);
    return rows.map((row) => new Attempt(row as AttemptRow));
  }

  static async retrieveAllAttemptsByChallenge(challenge_id: number) {
    const { rows } = await query('SELECT * FROM attempts WHERE challenge_id = $1', [challenge_id]);
    return rows.map((row) => new Attempt(row as AttemptRow));
  }
}
