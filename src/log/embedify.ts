import { MessageEmbed } from 'discord.js';
export default (description: string, title?: string, footer?: string, color?: string) => {
  const embed = new MessageEmbed()
    .setTitle(title ?? 'Unknown')
    .setColor(color ?? 'e74c3c')
    .setDescription(description)
    .setTimestamp()
    .setFooter(footer ?? '');
  return embed.toJSON();
};
