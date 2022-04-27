import { ColorResolvable, MessageEmbed } from 'discord.js';

export default (message: { description: string; title?: string; footer?: string; color?: ColorResolvable }) => {
  return new MessageEmbed()
    .setTitle(message.title ?? 'Unknown')
    .setColor(message.color ?? '#e74c3c')
    .setDescription(message.description)
    .setTimestamp()
    .setFooter({ text: message.footer ?? '' });
};
