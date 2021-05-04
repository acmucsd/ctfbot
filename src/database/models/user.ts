import { Attempt, Invite, Team } from '.';
import { AttemptRow, InviteRow, TeamRow, UserRow } from '../schemas';
import query from '../database';
import { Client, GuildChannel, MessageEmbed, TextChannel } from 'discord.js';
import { logger } from '../../log';

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

    // send to chat
    const currentTeam = await this.getTeam();
    const currentTeamChannel = (await client.channels.fetch(currentTeam.row.text_channel_snowflake)) as TextChannel;

    const message = new MessageEmbed();
    message.color = 15158332;
    message.title = `You have been invited to join **Team ${team.row.name}**`;
    message.description = 'You can accept this invite if you ***react to this message*** with :+1:.';
    message.description += '\n\nYour team chat will be deleted and you will be added to their team chats.';
    message.description += '\n\n**You may also need to join their team server if they are in a different region.**';
    message.description += '\nIf so, look for your new team server chat in the Main Guild.';
    message.addField(
      '⚠️  WARNING  ⚠️',
      'If you join a team, you will not be able to leave it or join another.\\n\\n***Make sure this is the team you would like to join.***',
    );

    const sentMessage = await currentTeamChannel.send(message);
    await sentMessage.react('👍');

    const {
      rows,
    } = await query(
      `INSERT INTO invites(user_id, team_id, was_invited) VALUES (${this.row.id}, $1, true) RETURNING *`,
      [team.row.id],
    );
    return new Invite(rows[0] as InviteRow);
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
}
