import { Client, MessageActionRow, MessageButton, MessageEmbed, TextChannel } from 'discord.js';
import { Ctf } from '../../database/models/Ctf';
import { setChannelContent } from '../util/ResourceManager';

export async function setTosMessage(client: Client<true>, channel: TextChannel, ctf: Ctf) {
  // todo: json-schema verify this before parsing
  const embeds = JSON.parse(ctf.tosMessage) as MessageEmbed[];
  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId('tosAgree').setLabel('I Understand and Agree').setStyle('PRIMARY'),
  );

  const fullMessage = {
    content: `Below is everything you need to know to compete in ${ctf.name}.
You will need to react to this message to indicate you have read and understood the rules before the competition will become available to you.
**Please ensure your device supports embeds.**`,
    embeds,
    components: [row],
  };

  await setChannelContent(client, channel, fullMessage);
}
