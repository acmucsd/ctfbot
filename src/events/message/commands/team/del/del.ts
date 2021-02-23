import { Message, Role } from 'discord.js';
import { CTF, Team, TeamServer } from '../../../../../database/models';
import logger from '../../../../../log';

const del = async (message: Message, team_role?: Role) => {
  let ctf: CTF;
  let teamServer: TeamServer;
  let teamToDelete: Team;
  try {
    // On a TeamServer
    teamServer = null; // await CTF.fromGuildSnowflakeTeamServer(message.guild.id);
    ctf = await CTF.fromIdCTF(teamServer.row.ctf_id);
    const Teams = await teamServer.getAllTeams();
    if (team_role) {
      teamToDelete = Teams.find((team) => team.row.team_role_snowflake_team_server === team_role.id);
    } else {
      const teamID = (await ctf.fromUserSnowflakeUser(message.author.id)).row.team_id;
      teamToDelete = Teams.find((team) => team.row.id === (teamID));
    }
  } catch {
    // On main CTF Server (which is 100% not also a team server)
    ctf = await CTF.fromGuildSnowflakeCTF(message.guild.id);
    const TeamServers = await ctf.getAllTeamServers();
    let Teams: Team[] = [];
    // eslint-disable-next-line
    for (const server of TeamServers) {
      // eslint-disable-next-line
      const teams = await server.getAllTeams();
      Teams = Teams.concat(teams);
    }
    if (team_role) {
      teamToDelete = Teams.find((team) => team.row.team_role_snowflake_main === team_role.id);
    } else {
      const teamID = (await ctf.fromUserSnowflakeUser(message.author.id)).row.team_id;
      teamToDelete = Teams.find((team) => team.row.id === (teamID));
    }
    // Check if teamToDeleteExists?
    teamServer = await CTF.fromIdTeamServer(teamToDelete.row.team_server_id);
  }
  await teamToDelete.deleteTeam();
  logger(`Deleted team "${teamToDelete.row.name}" from ctf "${ctf.row.name}`);
  // Remove Role from Main server
  // Remove role from team server
  // Remove text channel from team server
  // make and assign each member a new team
  // each new team make sure it goes to a team server with space
};

export default del;
