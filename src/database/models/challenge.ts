import query from '../database';
import { AttachmentRow, AttemptRow, CategoryRow, ChallengeChannelRow, ChallengeRow, CTFRow } from '../schemas';
import Attachment from './attachment';
import Attempt from './attempt';
import { GuildChannel, Client, TextChannel, MessageEmbed } from 'discord.js';
import CTF from './ctf';
import { Category, TeamServer } from './index';
import attach from '../../events/interaction/commands/challenge/attach';
import User from './user';
import { timingSafeEqual } from 'crypto';

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
    // delete the channels
    const channels = await this.getChallengeGuildChannels(client);
    for (const channel of channels) {
      await channel.delete();
    }

    // lastly, delete the database entry itself
    // (should cascade to delete challenge channels)
    await query(`DELETE FROM challenges WHERE id = ${this.row.id}`);
  }

  /** Challenge Setters */
  // Unique per CTF
  async setName(client: Client, name: string) {
    await query(`UPDATE challenges SET name = $1 WHERE id = ${this.row.id}`, [name]);

    // rename the challenge channels on discord
    const channels = await this.getChallengeGuildChannels(client);
    for (const channel of channels) {
      await channel.setName(name);
    }

    this.row.name = name;

    await this.updateChallengeChannels(client);
  }

  async setAuthor(client: Client, author: string) {
    await query(`UPDATE challenges SET author = $1 WHERE id = ${this.row.id}`, [author]);

    this.row.author = author;

    await this.updateChallengeChannels(client);
  }

  async setPrompt(client: Client, prompt: string) {
    await query(`UPDATE challenges SET prompt = $1 WHERE id = ${this.row.id}`, [prompt]);
    this.row.prompt = prompt;

    await this.updateChallengeChannels(client);
  }

  async setDifficulty(client: Client, difficulty: string) {
    await query(`UPDATE challenges SET difficulty = $1 WHERE id = ${this.row.id}`, [difficulty]);
    this.row.difficulty = difficulty;

    await this.updateChallengeChannels(client);
  }

  async setInitialPoints(client: Client, initial_points: number) {
    await query(`UPDATE challenges SET initial_points = $1 WHERE id = ${this.row.id}`, [initial_points]);
    this.row.initial_points = initial_points;

    await this.updateChallengeChannels(client);
  }

  async setPointDecay(client: Client, point_decay: number) {
    await query(`UPDATE challenges SET point_decay = $1 WHERE id = ${this.row.id}`, [point_decay]);
    this.row.point_decay = point_decay;

    await this.updateChallengeChannels(client);
  }

  async setMinPoints(client: Client, min_points: number) {
    await query(`UPDATE challenges SET min_points = $1 WHERE id = ${this.row.id}`, [min_points]);
    this.row.min_points = min_points;

    await this.updateChallengeChannels(client);
  }

  async setFlag(flag: string) {
    await query(`UPDATE challenges SET flag = $1 WHERE id = ${this.row.id}`, [flag]);
    this.row.flag = flag;
  }

  // Valid User in the CTF(?)
  async setFirstBlood(client: Client, first_blood_id: number) {
    await query(`UPDATE challenges SET first_blood_id = $1 WHERE id = ${this.row.id}`, [first_blood_id]);
    this.row.first_blood_id = first_blood_id;

    await this.updateChallengeChannels(client);
  }

  async setPublishTime(publish_time: Date) {
    await query(`UPDATE challenges SET publish_time = $1 WHERE id = ${this.row.id}`, [publish_time]);
    this.row.publish_time = publish_time;
  }

  /** Attachment Creation */
  async createAttachment(client: Client, name: string, url: string) {
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

    await this.updateChallengeChannels(client);

    return new Attachment(rows[0] as AttachmentRow);
  }

  // the almighty flag submission algorithm
  // returns the attempt
  async submitFlag(client: Client, user: User, flag: string) {
    // is after the publish date
    if (this.ctf.row?.start_date > new Date()) throw new Error('ctf has not yet been published');

    // has this team already solved this challenge?
    const team = await user.getTeam();
    const hasSolved = await team.hasSolvedChallenge(this);
    if (hasSolved) throw new Error('Your team has already solved this challenge!');

    const realFlag = Buffer.from(this.row.flag);
    const providedFlag = Buffer.from(flag);

    // use timing-safe comparison to verify if the flag is correct
    if (realFlag.length === providedFlag.length && timingSafeEqual(realFlag, providedFlag)) {
      const attempt = await user.createAttempt(this.row.id, flag, true, new Date());

      // send a notice to the team channel
      const solves = await this.getSolves();
      const points = this.getCurrentPoints(solves);

      // update first blood
      if (solves === 1) await this.setFirstBlood(client, user.row.id);

      const channel = await team.getTeamChannel(client);
      const congratsMessage = new MessageEmbed();
      congratsMessage.setTitle('🎉 Congratulations! 🎉');
      congratsMessage.description = `Player <@${user.row.user_snowflake}> submitted the **correct** flag for the challenge **${this.row.name}**, and your team has been awarded ${points} points.`;
      congratsMessage.description += `\n\nYou are the #**${solves}** person to solve this challenge.`;
      congratsMessage.addField('Team Points', `${await team.calculatePoints()}`);
      congratsMessage.addField('Place Overall', `${21}`);
      congratsMessage.addField('Challenges Unlocked', '#mann-hunt2');
      congratsMessage.setTimestamp();
      congratsMessage.setColor('50c0bf');

      await channel.send(congratsMessage);
      return attempt;
    }

    return await user.createAttempt(this.row.id, flag, false, new Date());
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

  async getSolves(): Promise<number> {
    const { rows } = await query(
      `SELECT COUNT(id) FROM attempts WHERE challenge_id = ${this.row.id} AND successful = true`,
    );
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
    return rows && rows[0].count && parseInt(rows[0].count);
  }

  getCurrentPoints(solves: number) {
    const a = this.row.initial_points || 0;
    const b = this.row.min_points || 0;
    const s = this.row.point_decay || 1;

    return Math.max(Math.ceil(((b - a) / (s * s)) * (solves * solves) + a), b);
  }

  // get challenge category
  async getCategory() {
    const { rows } = await query(`SELECT * FROM categories WHERE id = ${this.row.category_id}`);
    return new Category(rows[0] as CategoryRow, this.ctf);
  }

  // get the channels that correspond with this challenge
  async getChallengeGuildChannels(client: Client) {
    const channels = await this.getChallengeChannels();

    return await Promise.all(
      channels.map((channel) => client.channels.resolve(channel.channel_snowflake) as TextChannel),
    );
  }

  async getChallengeChannels() {
    const { rows } = await query(`SELECT * FROM challenge_channels WHERE challenge_id = ${this.row.id}`);
    if (!rows) throw new Error('No channels corresponding with this challenge id found.');

    return rows.map((row) => row as ChallengeChannelRow);
  }

  async updateChallengeChannels(client: Client) {
    const category = await this.getCategory();

    const challengeMessage = new MessageEmbed();
    challengeMessage.setTitle(this.row.name);
    challengeMessage.setDescription(this.row.prompt);
    challengeMessage.setAuthor(`${category.row.name} - ${this.row.difficulty}`);
    challengeMessage.setFooter(`By ${this.row.author}`);
    challengeMessage.setTimestamp();
    challengeMessage.setColor('50c0bf');

    const attachments = await this.getAllAttachments();
    attachments.forEach((attachment) => challengeMessage.addField(attachment.row.name, attachment.row.url));

    const solvesMessage = new MessageEmbed();
    const solves = await this.getSolves();
    // if there are no solves, the message is slightly different
    if (solves === 0) {
      solvesMessage.setTitle('🚨 This challenge current has no solves! 🚨');
      solvesMessage.setDescription('Do you have what it takes to be the first?');
    } else {
      const user = await User.fromID(this.row.first_blood_id);
      const team = await user.getTeam();
      // try and pull the display name from the main guild, otherwise use their username
      const username =
        this.ctf.getGuild(client).members.resolve(user.row.user_snowflake).displayName ||
        client.users.resolve(user.row.user_snowflake).username;
      solvesMessage.setTitle('🔓 This challenge has been solved 🔓');
      solvesMessage.setDescription(
        `The first to solve this challenge was **${username}** from **Team ${team.row.name}**`,
      );
    }
    solvesMessage.addField('Current # of Solves', `${solves}`, true);
    solvesMessage.addField('Current Point Value', `${this.getCurrentPoints(solves)}`, true);
    solvesMessage.setTimestamp();
    solvesMessage.setColor('e91e63');

    const channels = await this.getChallengeChannels();
    for (const channel of channels) {
      const guildChannel = client.channels.resolve(channel.channel_snowflake) as TextChannel;
      const messages = await guildChannel.messages.fetch();

      // find only the messages we've sent
      const botMessages = messages.filter((message) => message.author.id === client.user.id);
      // if the challenge messages don't already exist, we need to send them
      if (!botMessages || botMessages.size === 0) {
        await guildChannel.send(challengeMessage);
        await guildChannel.send(solvesMessage);
        return;
      }

      // otherwise, we need to edit them
      await botMessages.array()[0].edit(solvesMessage);
      await botMessages.array()[1].edit(challengeMessage);
    }
  }
}
