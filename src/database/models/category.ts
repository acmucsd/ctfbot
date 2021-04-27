import query from '../database';
import { CategoryRow, ChallengeRow } from '../schemas';
import Challenge from './challenge';
import CTF from './ctf';
import { Client } from 'discord.js';
import { DupeChallengeError } from '../../errors';

export default class Category {
  row: CategoryRow;
  ctf: CTF;

  constructor(row: CategoryRow, ctf: CTF) {
    this.row = row;
    this.ctf = ctf;
  }

  /* Category Creation / Deletion */

  // makeCategory made in CTF

  async deleteCategory(client: Client) {
    await query(`DELETE FROM categories WHERE id = ${this.row.id}`);
    // delete the channel category associated
    await this.getChannelCategory(client).delete();
    return `The category **${this.row.name}** has been deleted.`;
  }

  /** Category Setters */
  // Unique per CTF
  async setName(client: Client, name: string) {
    await query(`UPDATE categories SET name = $1 WHERE id = ${this.row.id}`, [
      name,
    ]);

    // rename the category on discord
    const category = this.getChannelCategory(client);
    await category.setName(name.toLowerCase());

    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(
      `UPDATE categories SET description = $1 WHERE id = ${this.row.id}`,
      [description],
    );
    this.row.description = description;
  }

  /** Challenge Creation */
  async createChallenge(client: Client, name: string) {
    // check if this challenge already exists in this ctf
    const {
      rows: existingRows,
    } = await query(
      `SELECT id FROM challenges WHERE name = $1 and category_id = ${this.row.id}`,
      [name],
    );
    if (existingRows && existingRows.length > 0) throw new DupeChallengeError();

    // create a text channel for this challenge
    const channel = await this.ctf.getGuild(client).channels.create(name);
    await channel.setParent(this.row.channel_category_snowflake);

    const {
      rows,
    } = await query(
      `INSERT INTO challenges (name, category_id, channel_snowflake) VALUES ($1, ${this.row.id}, ${channel.id}) RETURNING *`,
      [name],
    );
    return new Challenge(rows[0] as ChallengeRow, this.ctf);
  }

  async getAllChallenges() {
    const { rows } = await query(
      `SELECT * FROM challenges WHERE category_id = ${this.row.id}`,
    );
    return rows.map((row) => new Challenge(row as ChallengeRow, this.ctf));
  }

  // misc
  getChannelCategory(client: Client) {
    const category = this.ctf
      .getGuild(client)
      .channels.resolve(this.row.channel_category_snowflake);
    if (!category)
      throw new Error(
        'No channel category corresponding with this category id found.',
      );
    return category;
  }
}
