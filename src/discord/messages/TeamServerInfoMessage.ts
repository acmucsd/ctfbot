import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { TeamServer } from '../../database/models/TeamServer';
import { CTF } from '../../database/models/CTF';
import { setChannelContent } from '../util/ResourceManager';

export async function setTeamServerInfoMessage(
  client: Client<true>,
  channel: TextChannel,
  ctf: CTF,
  teamServer: TeamServer,
) {
  const infoMessage = new MessageEmbed();
  infoMessage.setAuthor({ name: ctf.name });
  infoMessage.setTitle(`Welcome to ${teamServer.name} 👋`);
  infoMessage.setColor('#50c0bf');

  infoMessage.description = `This is a *team server* for **${ctf.name}**.
  It hosts **team channels** and **challenge channels** for the competition.
  
  By joining, you should have been given the <@&${
    teamServer.participantRoleSnowflake ?? ''
  }> role and your team role, and you should have access to one channel under the **TEAMS** category, that is your workspace for this CTF. You can find more information there.
  
  If you cannot find it, please let a <@&${teamServer.adminRoleSnowflake ?? ''}> know.
  
  If you are not participating in the competition or if this is not the team server you have been assigned, you will be shortly kicked.`;

  await setChannelContent(client, channel, infoMessage);
}
