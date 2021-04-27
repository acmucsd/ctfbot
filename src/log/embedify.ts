import { MessageEmbed } from 'discord.js';
export default (message: {
  description: string;
  title?: string;
  footer?: string;
  color?: string;
}) => {
  const embed = new MessageEmbed()
    .setTitle(message.title ?? 'Unknown')
    .setColor(message.color ?? 'e74c3c')
    .setDescription(message.description)
    .setTimestamp()
    .setFooter(message.footer ?? '');
  return embed.toJSON();
};
