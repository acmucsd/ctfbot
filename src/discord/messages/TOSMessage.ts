import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { Ctf } from '../../database/models/Ctf';
import { setChannelContent } from '../util/ResourceManager';

export async function setTOSMessage(client: Client<true>, channel: TextChannel, ctf: Ctf) {
  // todo: json-schema verify this before parsing
  const messages = JSON.parse(ctf.tosMessage) as MessageEmbed[];
  await setChannelContent(client, channel, ...messages);
}
