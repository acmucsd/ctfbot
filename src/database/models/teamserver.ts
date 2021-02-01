import Team from './team';
import query from '../database';
import { TeamRow } from '../schemas/team';
import { TeamServerRow } from '../schemas/teamserver';

export default class TeamServer {
  row: TeamServerRow;

  constructor(row: TeamServerRow) {
    this.row = row;
  }

  // createTeamServer made in CTF

  // Unique among ALL TeamServers
  async setGuildSnowflake(guild_snowflake: string) {
    await query(`UPDATE teamservers SET guild_snowflake = $1 WHERE id = ${this.row.id}`, [guild_snowflake]);
    this.row.guild_snowflake = guild_snowflake;
  }

  async setCTFID(ctf_id: number) {
    await query(`UPDATE teamservers SET ctf_id = $1 WHERE id = ${this.row.id}`, [ctf_id]);
    this.row.ctf_id = ctf_id;
  }

  // Unique among other channels, valid for the TeamServer guild
  async setInfoChannelSnowflake(info_channel_snowflake: string) {
    await query(`UPDATE teamservers SET info_channel_snowflake = $1 WHERE id = ${this.row.id}`, [info_channel_snowflake]);
    this.row.info_channel_snowflake = info_channel_snowflake;
  }

  // Unique among other channels, valid for the TeamServer guild
  async setTeamCategorySnowflake(team_category_snowflake: string) {
    await query(`UPDATE teamservers SET team_category_snowflake = $1 WHERE id = ${this.row.id}`, [team_category_snowflake]);
    this.row.team_category_snowflake = team_category_snowflake;
  }

  // Unique per CTF
  async setName(name: string) {
    await query(`UPDATE teamservers SET name = $1 WHERE id = ${this.row.id}`, [name]);
    this.row.name = name;
  }

  async setTeamLimit(team_limit: string) {
    await query(`UPDATE teamservers SET team_limit = $1 WHERE id = ${this.row.id}`, [team_limit]);
    this.row.team_limit = team_limit;
  }

  async makeTeam(team_role_snowflake: string, text_channel_snowflake: string, name: string, description: string, color: string) {
    // Checks

    const { rows } = await query(`INSERT INTO teams(team_role_snowflake, text_channel_snowflake, team_server_id, name, description, color) VALUES ($1, ${this.row.id}, $2, $3, $4, $5) RETURNING *`, [team_role_snowflake, text_channel_snowflake, name, description, color]);
    return new Team(rows[0] as TeamRow);
  }

  async deleteTeamServer() {
    await query(`DELETE FROM team_servers WHERE id = ${this.row.id}`);
  }
}
