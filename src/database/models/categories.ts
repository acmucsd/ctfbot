import query from '../database';
import { CategoriesRow } from '../schemas/categories';

export default class Categories {
  row: CategoriesRow;

  constructor(row: CategoriesRow) {
    this.row = row;
  }

  async setCTFId(ctf_id: number) {
    await query(`UPDATE categories SET ctf_id = $1 WHERE id = ${this.row.id}`, [ctf_id]);
    this.row.ctf_id = ctf_id;
  }

  async setName(name: string) {
    await query(`UPDATE categories SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setChannelSnowflake(channel_category_snowflake: string) {
    await query(`UPDATE categories SET channel_category_snowflake = $1 WHERE id = ${this.row.id}`, [channel_category_snowflake]);
    this.row.channel_category_snowflake = channel_category_snowflake;
  }

  async setDescription(description: string) {
    await query(`UPDATE categories SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  static async createCategory(name: string, ctf_id: number) {
    // check if a category already exists with that name
    const { rows: existingRows } = await query('SELECT id FROM categories WHERE name = $1', [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create a category with a duplicate name');

    const { rows } = await query('INSERT INTO categories(name, ctf_id) VALUES ($1, $2) RETURNING *', [name, ctf_id]);
    return new Categories(rows[0] as CategoriesRow);
  }
}
