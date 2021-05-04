import query from '../database';
import { CategoryChannelRow, CategoryRow, ChallengeChannelRow, ChallengeRow } from '../schemas';
import Challenge from './challenge';
import CTF from './ctf';
import { Client, GuildChannel } from 'discord.js';
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
    // delete the category channels associated
    const channels = await this.getCategoryGuildChannels(client);
    for (const channel of channels) {
      await channel.delete();
    }

    // lastly, delete the database entry itself
    // (should cascade to delete category channels)
    await query(`DELETE FROM categories WHERE id = ${this.row.id}`);

    return `The category **${this.row.name}** has been deleted.`;
  }

  /** Category Setters */
  // Unique per CTF
  async setName(client: Client, name: string) {
    await query(`UPDATE categories SET name = $1 WHERE id = ${this.row.id}`, [name]);

    // rename the category on discord
    const channels = await this.getCategoryGuildChannels(client);
    for (const channel of channels) {
      await channel.setName(name.toLowerCase());
    }

    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE categories SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  /** Challenge Creation */
  async createChallenge(client: Client, name: string) {
    // check if this challenge already exists in this ctf
    const {
      rows: existingRows,
    } = await query(`SELECT id FROM challenges WHERE name = $1 and category_id = ${this.row.id}`, [name]);
    if (existingRows && existingRows.length > 0) throw new DupeChallengeError();

    // insert new challenge row
    const { rows } = await query(`INSERT INTO challenges (name, category_id) VALUES ($1, ${this.row.id}) RETURNING *`, [
      name,
    ]);
    const challenge = new Challenge(rows[0] as ChallengeRow, this.ctf);

    const categoryChannels = await this.getCategoryChannels();
    const challengeChannels: string[] = [];

    // create a text channel for this challenge and add to the category
    for (const categoryChannel of categoryChannels) {
      const guildChannel = client.channels.resolve(categoryChannel.channel_snowflake) as GuildChannel;
      const channel = await guildChannel.guild.channels.create(name);
      await channel.setParent(categoryChannel.channel_snowflake);
      // build the VALUES query as we go
      challengeChannels.push(`(${challenge.row.id}, ${categoryChannel.teamserver_id}, ${channel.id})`);
    }

    // insert all new challenge channels into the db at once
    if (challengeChannels.length > 0)
      await query(
        `INSERT INTO challenge_channels (challenge_id, teamserver_id, channel_snowflake) VALUES ${challengeChannels.join()}`,
      );

    return challenge;
  }

  async getAllChallenges() {
    const { rows } = await query(`SELECT * FROM challenges WHERE category_id = ${this.row.id}`);
    return rows.map((row) => new Challenge(row as ChallengeRow, this.ctf));
  }

  // misc
  async getCategoryChannels() {
    const { rows } = await query(`SELECT * FROM category_channels WHERE category_id = ${this.row.id}`);
    if (!rows) throw new Error('No channels corresponding with this category id found.');

    return rows.map((row) => row as CategoryChannelRow);
  }

  async getCategoryGuildChannels(client: Client) {
    const categoryChannels = await this.getCategoryChannels();
    return await Promise.all(
      categoryChannels.map((chan) => client.channels.resolve(chan.channel_snowflake) as GuildChannel),
    );
  }
}
