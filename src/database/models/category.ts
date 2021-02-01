import query from '../database';
import { CategoryRow } from '../schemas/category';
import { ChallengeRow } from '../schemas/challenge';
import Challenges from './challenge';

export default class Category {
  row: CategoryRow;

  constructor(row: CategoryRow) {
    this.row = row;
  }

  // makeCategory made in CTF

  // Unique per CTF
  async setName(name: string) {
    await query(`UPDATE categories SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  // Unique among other used channels, valid for CTF guild
  async setChannelSnowflake(channel_category_snowflake: string) {
    await query(`UPDATE categories SET channel_category_snowflake = $1 WHERE id = ${this.row.id}`, [channel_category_snowflake]);
    this.row.channel_category_snowflake = channel_category_snowflake;
  }

  async setDescription(description: string) {
    await query(`UPDATE categories SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  async createChallenge(name: string, ctf_id: number) {
    // check if this challenge already exists in this ctf
    const { rows: existingRows } = await query('SELECT id FROM challenges WHERE name = $1 and ctf_id = $2', [name, ctf_id]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a duplicate challenge in this ctf');

    const { rows } = await query('INSERT INTO ctfs(name, ctf_id, category_id) VALUES ($1, $2, $3) RETURNING *', [name, ctf_id, this.row.id]);
    return new Challenges(rows[0] as ChallengeRow);
  }

  async deleteCategory() {
    await query(`DELETE FROM categories WHERE id = ${this.row.id}`);
  }
}
