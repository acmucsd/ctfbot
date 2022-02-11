import { Client } from 'discord.js';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { setTeamServerInfoMessage } from '../messages/TeamServerInfoMessage';
import {
  createInviteOrFetchIfExists,
  createRoleOrFetchIfExists,
  createTextChannelOrFetchIfExists,
  destroyChannels,
  destroyRoles,
  registerGuildCommandsIfChanged,
} from '../util/ResourceManager';
import { setTeamServerInviteChannelMessage } from '../messages/TeamServerInviteChannelMessage';

export async function refreshTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  const ctf = await teamServer.getCTF({ attributes: ['name', 'guildSnowflake'] });
  const ctfGuild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!ctfGuild) throw createDiscordNullError('guildSnowflake');

  // if this guild is also the main server, this will naturally resolve to those existing roles

  // create adminRole
  const adminRole = await createRoleOrFetchIfExists(guild, teamServer.adminRoleSnowflake, 'CTF Admin');
  teamServer.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole = await createRoleOrFetchIfExists(guild, teamServer.participantRoleSnowflake, 'Participant');
  teamServer.participantRoleSnowflake = participantRole.id;

  // create infoChannel
  const infoChannel = await createTextChannelOrFetchIfExists(guild, teamServer.infoChannelSnowflake, 'info');
  teamServer.infoChannelSnowflake = infoChannel.id;

  // set the content of the infoChannel
  await setTeamServerInfoMessage(client, infoChannel, ctf, teamServer);

  // create serverInvite
  const serverInvite = await createInviteOrFetchIfExists(infoChannel, teamServer.serverInvite);
  teamServer.serverInvite = serverInvite.code;

  // create inviteRole in the original ctf server
  const inviteRole = await createRoleOrFetchIfExists(ctfGuild, teamServer.inviteRoleSnowflake, teamServer.name);
  teamServer.inviteRoleSnowflake = inviteRole.id;

  // create inviteChannel in the original ctf guild
  const inviteChannel = await createTextChannelOrFetchIfExists(
    ctfGuild,
    teamServer.inviteChannelSnowflake,
    teamServer.name,
    { readRoles: [inviteRole.id] },
  );
  teamServer.inviteChannelSnowflake = inviteChannel.id;

  // set content of the invite channel
  await setTeamServerInviteChannelMessage(client, inviteChannel, ctf, teamServer);

  // register guild commands
  await registerGuildCommandsIfChanged(client, guild, participantRole, adminRole);
}

export async function destroyTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  const ctf = await teamServer.getCTF({ attributes: ['name', 'guildSnowflake'] });
  const ctfGuild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!ctfGuild) throw createDiscordNullError('guildSnowflake');

  await destroyRoles(guild, teamServer.adminRoleSnowflake, teamServer.participantRoleSnowflake);
  await destroyChannels(guild, teamServer.infoChannelSnowflake);

  await destroyRoles(ctfGuild, teamServer.inviteRoleSnowflake);
  await destroyChannels(ctfGuild, teamServer.inviteChannelSnowflake);

  // oh yeah the commands too
  await guild.commands.set([]);
}
