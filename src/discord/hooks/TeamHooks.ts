import { Client } from 'discord.js';
import { Team } from '../../database/models/Team';
import {
  createTextChannelOrFetchIfExists,
  destroyChannels,
  ensureUsersHaveRolesOnGuild,
} from '../util/ResourceManager';
import { Ctf } from '../../database/models/Ctf';

export async function refreshTeam(team: Team, client: Client<true>) {
  const teamServer = await team.getTeamServer({ include: [{ model: Ctf }] });
  const teamGuild = await client.guilds.fetch(teamServer.guildSnowflake);

  // get the user snowflakes of this team
  const users = (await team.getUsers({ attributes: ['userSnowflake'] })).map((u) => u.userSnowflake);
  // grant every user in this team the participant role
  await ensureUsersHaveRolesOnGuild(users, [teamServer.participantRoleSnowflake], teamGuild);

  // ensure that each team member has the team server role in the main guild
  if (teamServer.Ctf) {
    const ctfGuild = await client.guilds.fetch(teamServer.Ctf.guildSnowflake);
    await ensureUsersHaveRolesOnGuild(users, [teamServer.inviteRoleSnowflake], ctfGuild);
  }

  // create a team channel for this team
  // give current users explicit permission to see it
  const teamChannel = await createTextChannelOrFetchIfExists(teamGuild, team.textChannelSnowflake, team.name, {
    readRoles: users,
    writeRoles: users,
  });
  team.textChannelSnowflake = teamChannel.id;
}

// note: under almost no circumstances will be a team be destroyed
// UNLESS you leave your initial team to join another
export async function destroyTeam(team: Team, client: Client<true>) {
  // destroy dependant teams
  const users = await team.getUsers();
  await Promise.all(users.map((user) => user.destroy()));

  const teamServer = await team.getTeamServer();
  const teamGuild = await client.guilds.fetch(teamServer.guildSnowflake);

  await destroyChannels(teamGuild, team.textChannelSnowflake);
}
