import Team from './team';
import query from '../database';
import { TeamRow } from '../schemas/team';
import { TeamServerRow } from '../schemas/teamserver';

export default class TeamServer {
  row: TeamServerRow;

  constructor(row: TeamServerRow) {
    this.row = row;
  }

  /** TeamServer Creation / Deletion */
  // createTeamServer made in CTF

  async deleteTeamServer() {
    await query(`DELETE FROM team_servers WHERE id = ${this.row.id}`);
  }

  /** TeamServer Setters */
  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setInfoChannelSnowflake(info_channel_snowflake: string) {
    await query(`UPDATE teamservers SET info_channel_snowflake = ${info_channel_snowflake} WHERE id = ${this.row.id}`);
    this.row.info_channel_snowflake = info_channel_snowflake;
  }

  // Unique among other channels, valid for the TeamServer guild <- taken care of because it's made, not specified
  async setTeamCategorySnowflake(team_category_snowflake: string) {
    await query(`UPDATE teamservers SET team_category_snowflake = ${team_category_snowflake} WHERE id = ${this.row.id}`);
    this.row.team_category_snowflake = team_category_snowflake;
  }

  /** Team Creation */
  async makeTeam(name: string) {
    // Checks

    const { rows } = await query(`INSERT INTO teams(team_server_id, name) VALUES ($1, ${this.row.id}) RETURNING *`, [name]);
    return new Team(rows[0] as TeamRow);
  }

  /** Team Retrieval */
  async fromNameTeam(name: string) {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id} and name = $1`, [name]);
    if (rows.length === 0) throw new Error('no team with that name in this ctf');
    return new Team(rows[0] as TeamRow);
  }

  static async fromRoleTeam(team_role_snowflake: string) {
    const { rows } = await query('SELECT * FROM teams WHERE team_role_snowflake_main = $1 or team_role_snowflake_team_server = $1 ', [team_role_snowflake]);
    if (rows.length === 0) throw new Error('no team with that role in this server');
    return new Team(rows[0] as TeamRow);
  }

  static async fromChannelTeam(text_channel_snowflake: string) {
    const { rows } = await query('SELECT * FROM teams WHERE  and text_channel_snowflake = $1', [text_channel_snowflake]);
    if (rows.length === 0) throw new Error('no team associated with that channel');
    return new Team(rows[0] as TeamRow);
  }

  async getAllTeams() {
    const { rows } = await query(`SELECT * FROM teams WHERE team_server_id = ${this.row.id}`);
    return rows.map((row) => new Team(row as TeamRow));
  }
}
