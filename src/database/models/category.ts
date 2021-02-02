import query from '../database';
import { CategoryRow } from '../schemas/category';
import { ChallengeRow } from '../schemas/challenge';
import Challenge from './challenge';

export default class Category {
  row: CategoryRow;

  constructor(row: CategoryRow) {
    this.row = row;
  }

  /* Category Creation / Deletion */
  // makeCategory made in CTF

  async deleteCategory() {
    await query(`DELETE FROM categories WHERE id = ${this.row.id}`);
  }

  /** Category Setters */
  // Unique per CTF
  async setName(name: string) {
    await query(`UPDATE categories SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE categories SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  /** Challenge Creation */
  async createChallenge(name: string) {
    // check if this challenge already exists in this ctf
    const { rows: existingRows } = await query(`SELECT id FROM challenges WHERE name = $1 and ctf_id = ${this.row.ctf_id}`, [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a duplicate challenge in this ctf');

    const { rows } = await query(`INSERT INTO ctfs(name, ctf_id, category_id) VALUES ($1, ${this.row.ctf_id}, $3) RETURNING *`, [name, this.row.id]);
    return new Challenge(rows[0] as ChallengeRow);
  }

  /** Challenge Retrieval */
  async fromNameChallenge(name: string) {
    const { rows } = await query(`SELECT * FROM challenges WHERE name = $1 and ctf_id = ${this.row.ctf_id}`, [name]);
    if (rows.length === 0) throw new Error('no challenge with that name in this ctf');
    return new Challenge(rows[0] as ChallengeRow);
  }

  async fromChannelSnowflakeChallenge(channel_snowflake: string) {
    const { rows } = await query(`SELECT * FROM challenges WHERE channel_snowflake = $1 and ctf_id = ${this.row.ctf_id}`, [channel_snowflake]);
    if (rows.length === 0) throw new Error('no challenge with that channel in this ctf');
    return new Challenge(rows[0] as ChallengeRow);
  }

  async getAllChallenges() {
    const { rows } = await query(`SELECT * FROM challenges WHERE category_id = ${this.row.id}`);
    return rows.map((row) => new Category(row as CategoryRow));
  }
}
