import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { TeamServer } from '../../database/models/TeamServer';
import { Ctf } from '../../database/models/Ctf';
import { setChannelContent } from '../util/ResourceManager';

export async function setTeamServerInviteChannelMessage(
  client: Client<true>,
  channel: TextChannel,
  ctf: Ctf,
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
