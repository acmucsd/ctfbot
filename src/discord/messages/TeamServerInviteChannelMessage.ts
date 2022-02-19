import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { TeamServer } from '../../database2/models/TeamServer';
import { CTF } from '../../database2/models/CTF';
import { setChannelContent } from '../util/ResourceManager';

export async function setTeamServerInviteChannelMessage(
  client: Client<true>,
  channel: TextChannel,
  ctf: CTF,
  teamServer: TeamServer,
) {
  const infoMessage = new MessageEmbed();
  infoMessage.setAuthor({ name: ctf.name });
  infoMessage.setTitle(`Your team has been placed in a Team Server`);
  infoMessage.setColor('#50c0bf');

  infoMessage.description = `Your dedicated CTF environment is **${teamServer.name}**.
   Please join using the following invite to participate and access the challenges.
   https://discord.gg/${teamServer.serverInvite}
   `;

  await setChannelContent(client, channel, infoMessage);
}
