import query from '../database';
import { AttachmentRow, AttemptRow, CategoryRow, ChallengeRow } from '../schemas';
import Attachment from './attachment';
import Attempt from './attempt';
import { Client } from 'discord.js';
import CTF from './ctf';
import { Category } from './index';

export default class Challenge {
  row: ChallengeRow;
  ctf: CTF;

  constructor(row: ChallengeRow, ctf: CTF) {
    this.row = row;
    this.ctf = ctf;
  }

  /** Challenge Creation / Deletion */
  // makeChallenge made in Category

  async deleteChallenge(client: Client) {
    await query(`DELETE FROM challenges WHERE id = ${this.row.id}`);

    // delete the channel
    const channel = this.getChannelChallenge(client);
    await channel.delete();
  }

  /** Challenge Setters */
  // Unique per CTF
  async setName(client: Client, name: string) {
    await query(`UPDATE challenges SET name = $1 WHERE id = ${this.row.id}`, [name]);

    // rename the challenge channel on discord
    const channel = this.getChannelChallenge(client);
    await channel.setName(name);

    this.row.name = name;
  }

  async setAuthor(author: string) {
    await query(`UPDATE challenges SET author = $1 WHERE id = ${this.row.id}`, [author]);
    this.row.author = author;
  }

  async setPrompt(prompt: string) {
    await query(`UPDATE challenges SET prompt = $1 WHERE id = ${this.row.id}`, [prompt]);
    this.row.prompt = prompt;
  }

  async setDifficulty(difficulty: string) {
    await query(`UPDATE challenges SET difficulty = $1 WHERE id = ${this.row.id}`, [difficulty]);
    this.row.difficulty = difficulty;
  }

  async setInitialPoints(initial_points: number) {
    await query(`UPDATE challenges SET initial_points = $1 WHERE id = ${this.row.id}`, [initial_points]);
    this.row.initial_points = initial_points;
  }

  async setPointDecay(point_decay: number) {
    await query(`UPDATE challenges SET point_decay = $1 WHERE id = ${this.row.id}`, [point_decay]);
    this.row.point_decay = point_decay;
  }

  async setMinPoints(min_points: number) {
    await query(`UPDATE challenges SET min_points = $1 WHERE id = ${this.row.id}`, [min_points]);
    this.row.min_points = min_points;
  }

  async setFlag(flag: string) {
    await query(`UPDATE challenges SET flag = $1 WHERE id = ${this.row.id}`, [flag]);
    this.row.flag = flag;
  }

  // Valid User in the CTF(?)
  async setFirstBlood(first_blood_id: number) {
    await query(`UPDATE challenges SET first_blood_id = $1 WHERE id = ${this.row.id}`, [first_blood_id]);
    this.row.first_blood_id = first_blood_id;
  }

  async setPublishTime(publish_time: Date) {
    await query(`UPDATE challenges SET publish_time = $1 WHERE id = ${this.row.id}`, [publish_time]);
    this.row.publish_time = publish_time;
  }

  /** Attachment Creation */
  async createAttachment(name: string, url: string) {
    // check if a attachment already exists with that name for the challenge
    const {
      rows: existingRows,
    } = await query(`SELECT id FROM attachments WHERE name = $1 and challenge_id = ${this.row.id}`, [name]);
    if (existingRows && existingRows.length > 0) throw new Error('cannot create an attachment with a duplicate name');

    const {
      rows,
    } = await query(`INSERT INTO attachments(challenge_id, name, url) VALUES (${this.row.id}, $1, $2) RETURNING *`, [
      name,
      url,
    ]);
    return new Attachment(rows[0] as AttachmentRow);
  }

  /** Attachment Retrieval */
  async fromNameAttachment(name: string) {
    const { rows } = await query(`SELECT * FROM attachments WHERE name = $1 and challenge_id = ${this.row.id}`, [name]);
    return new Attachment(rows[0] as AttachmentRow);
  }

  async getAllAttachments() {
    const { rows } = await query(`SELECT * FROM attachments WHERE challenge_id = ${this.row.id}`);
    return rows.map((row) => new Attachment(row as AttachmentRow));
  }

  /** Attempt Getter */
  async getAllAttempts() {
    const { rows } = await query(`SELECT * FROM attempts WHERE challenge_id = ${this.row.id}`);
    return rows.map((row) => new Attempt(row as AttemptRow));
  }

  // get challenge category
  async getCategory() {
    const { rows } = await query(`SELECT * FROM categories WHERE id = ${this.row.category_id}`);
    return new Category(rows[0] as CategoryRow, this.ctf);
  }

  // misc
  getChannelChallenge(client: Client) {
    const channel = this.ctf.getGuild(client).channels.resolve(this.row.channel_snowflake);
    if (!channel) throw new Error('No channel corresponding with this challenge id found.');
    return channel;
  }
}
