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

export async function refreshTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

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
  const ctf = await teamServer.getCTF({ attributes: ['name'] });
  await setTeamServerInfoMessage(client, infoChannel, ctf, teamServer);

  // create serverInvite
  const serverInvite = await createInviteOrFetchIfExists(infoChannel, teamServer.serverInvite);
  teamServer.serverInvite = serverInvite.code;

  // create inviteChannel
  // const inviteChannel =
  //   (teamServer.inviteChannelSnowflake && (await guild.channels.fetch(teamServer.inviteChannelSnowflake))) ||
  //   (await guild.channels.create('info', { type: 'GUILD_TEXT' }));
  // teamServer.inviteChannelSnowflake = inviteChannel.id;

  // register guild commands
  await registerGuildCommandsIfChanged(client, guild, participantRole, adminRole);
}

export async function destroyTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await destroyRoles(guild, teamServer.adminRoleSnowflake, teamServer.participantRoleSnowflake);
  await destroyChannels(guild, teamServer.infoChannelSnowflake);

  // oh yeah the commands too
  await guild.commands.set([]);
}
