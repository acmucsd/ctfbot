import { Client } from 'discord.js';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDiscordNullError } from '../../errors/DiscordNullError';

export async function refreshTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create infoChannel

  // create inviteChannel

  // create adminRole, but only if this isn't the main guild

  // create participantRole, but only if this isn't the main guild

  // create serverInvite
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
