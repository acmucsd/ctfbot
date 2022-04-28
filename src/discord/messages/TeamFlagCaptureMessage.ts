import { MessageEmbed, TextChannel } from 'discord.js';

export async function sendTeamFlagCaptureMessage(
  teamChannel: TextChannel,
  userSnowflake: string,
  challengeName: string,
  points: number,
  solves: number,
  totalPoints: number,
) {
  const message = new MessageEmbed();
  message.setTitle(`🎉 Flag Captured! 🎉`);
  message.setColor('#50c0bf');

  message.description = `Player <@${userSnowflake}> just captured a **correct** flag for the challenge **${challengeName}**.\n`;
  message.description += `Your team has been awarded ${points} points.\n`;
  message.description += `You are the #**${solves}** person to capture this flag.`;
  message.addField('Team Points', `${totalPoints}`);
  message.setTimestamp();

  await teamChannel.send({ embeds: [message] });
}
