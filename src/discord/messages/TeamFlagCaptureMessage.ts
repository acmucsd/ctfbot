import { MessageEmbed, TextChannel } from 'discord.js';
import { Team } from '../../database/models/Team';
import { User } from '../../database/models/User';
import { Flag } from '../../database/models/Flag';
import { Challenge } from '../../database/models/Challenge';

export async function sendTeamFlagCaptureMessage(
  teamChannel: TextChannel,
  team: Team,
  user: User,
  flag: Flag,
  challenge: Challenge,
) {
  const solves = await flag.countUsers();
  const totalPoints = await team.getPoints();

  const message = new MessageEmbed();
  message.setTitle(`🎉 Flag Captured! 🎉`);
  message.setColor('#50c0bf');

  message.description = `Player <@${user.userSnowflake}> just captured a **correct** flag for the challenge **${challenge.name}**.\n`;
  message.description += `Your team has been awarded ${flag.pointValue} points.\n`;
  message.description += `You are the #**${solves}** person to capture this flag.`;
  message.addField('Team Points', `${totalPoints}`);
  message.setTimestamp();

  await teamChannel.send({ embeds: [message] });
}
