import Invite from './invite';
import query from '../database';
import { InviteRow } from '../schemas/invite';
import { TeamRow } from '../schemas/team';

export default class Team {
  row: TeamRow;

  constructor(row: TeamRow) {
    this.row = row;
  }

  // makeTeam made in TeamServer

  // Valid Role in the TeamServer, unique among other Teams
  async setTeamRoleSnowflake(team_role_snowflake: string) {
    await query(`UPDATE teams SET team_role_snowflake = $1 WHERE id = ${this.row.id}`, [team_role_snowflake]);
    this.row.team_role_snowflake = team_role_snowflake;
  }

  // Valid Channel in the TeamServer, unique among other Teams
  async setTeamChannelSnowflake(text_channel_snowflake: string) {
    await query(`UPDATE teams SET text_channel_snowflake = $1 WHERE id = ${this.row.id}`, [text_channel_snowflake]);
    this.row.text_channel_snowflake = text_channel_snowflake;
  }

  async setTeamServerID(team_server_id: number) {
    await query(`UPDATE teams SET team_server_id = $1 WHERE id = ${this.row.id}`, [team_server_id]);
    this.row.team_server_id = team_server_id;
  }

  // Unique per CTF
  async setName(name: string) {
    await query(`UPDATE teams SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setDescription(description: string) {
    await query(`UPDATE teams SET description = $1 WHERE id = ${this.row.id}`, [description]);
    this.row.description = description;
  }

  async setColor(color: string) {
    await query(`UPDATE teams SET color = $1 WHERE id = ${this.row.id}`, [color]);
    this.row.color = color;
  }

  async createInvite(user_id: number, was_invited: boolean) {
    const { rows: existingRows } = await query(`SELECT id FROM invites WHERE team_id = ${this.row.id} and user_id = $1`, [user_id]);
    if (existingRows && existingRows.length > 0) throw new Error('invite already exists for this user');

    const { rows } = await query(`INSERT INTO categories(user_id, team_id, was_invited) VALUES ($1, ${this.row.id}, $2) RETURNING *`, [user_id, was_invited]);
    return new Invite(rows[0] as InviteRow);
  }

  async deleteTeam() {
    await query(`DELETE FROM teams WHERE id = ${this.row.id}`);
  }
}
