import { Client, TextChannel } from 'discord.js';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { setChannelContent } from '../util/setChannelContent';
import { getTeamServerInfoMessage } from '../messages/TeamServerInfoMessage';

export async function refreshTeamServer(teamServer: TeamServer, client: Client<true>) {
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create infoChannel
  const infoChannel =
    (teamServer.infoChannelSnowflake &&
      ((await guild.channels.fetch(teamServer.infoChannelSnowflake)) as TextChannel)) ||
    (await guild.channels.create('info', { type: 'GUILD_TEXT' }));
  teamServer.infoChannelSnowflake = infoChannel.id;

  // set channel permissions
  await infoChannel.permissionOverwrites.create(infoChannel.guild.roles.everyone, {
    SEND_MESSAGES: false,
    ADD_REACTIONS: false,
  });

  // set the content of the infoChannel
  const ctf = await teamServer.getCTF({ attributes: ['name'] });
  await setChannelContent(client, infoChannel, getTeamServerInfoMessage(ctf, teamServer));

  // create serverInvite
  const serverInvite =
    (await infoChannel.fetchInvites()).get(teamServer.serverInvite) ||
    (await infoChannel.createInvite({
      temporary: false,
      maxAge: 0,
    }));
  teamServer.serverInvite = serverInvite.code;

  // create inviteChannel
  // const inviteChannel =
  //   (teamServer.inviteChannelSnowflake && (await guild.channels.fetch(teamServer.inviteChannelSnowflake))) ||
  //   (await guild.channels.create('info', { type: 'GUILD_TEXT' }));
  // teamServer.inviteChannelSnowflake = inviteChannel.id;

  // if this guild is also the main server, this will naturally resolve to those existing roles

  // create adminRole
  const adminRole =
    (teamServer.adminRoleSnowflake && (await guild.roles.fetch(teamServer.adminRoleSnowflake))) ||
    (await guild.roles.create({ name: 'CTF Admin' }));
  teamServer.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole =
    (teamServer.participantRoleSnowflake && (await guild.roles.fetch(teamServer.participantRoleSnowflake))) ||
    (await guild.roles.create({ name: 'Participant' }));
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
