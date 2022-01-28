import { Client } from 'discord.js';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { setTeamServerInfoMessage } from '../messages/TeamServerInfoMessage';
import {
  createInviteOrFetchIfExists,
  createRoleOrFetchIfExists,
  createTextChannelOrFetchIfExists,
} from '../util/ResourceManager';

export async function refreshTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

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

  // if this guild is also the main server, this will naturally resolve to those existing roles

  // create adminRole
  const adminRole = await createRoleOrFetchIfExists(guild, teamServer.adminRoleSnowflake, 'CTF Admin');
  teamServer.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole = await createRoleOrFetchIfExists(guild, teamServer.participantRoleSnowflake, 'Participant');
  teamServer.participantRoleSnowflake = participantRole.id;
}

export async function destroyTeamServer(teamServer: TeamServer, client: Client<true>) {
  // const guild = await client.guilds.fetch(ctf.guildSnowflake);
  // if (!guild) throw createDiscordNullError('guildSnowflake');
  //
  // // delete all the roles and channels
  // const resources = await Promise.all([
  //   guild.roles.fetch(ctf.adminRoleSnowflake),
  //   guild.roles.fetch(ctf.participantRoleSnowflake),
  //   guild.channels.fetch(ctf.announcementsChannelSnowflake),
  //   guild.channels.fetch(ctf.tosChannelSnowflake),
  //   guild.channels.fetch(ctf.scoreboardChannelSnowflake),
  //   guild.channels.fetch(ctf.infoCategorySnowflake),
  // ]);
  // await Promise.all(resources.map((resource) => resource?.delete()));
  //
  // // oh yeah the commands too
  // await guild.commands.set([]);
}
