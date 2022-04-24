import { Client, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { User } from '../../database/models/User';
import { Team } from '../../database/models/Team';

export async function sentInviteAcceptanceMessages(
  client: Client<true>,
  user: User,
  newTeam: Team,
  newServerInvite: string,
) {
  const userConfirmationMessage = new MessageEmbed();
  userConfirmationMessage.setTitle(`Congrats on joining Team **${newTeam.name}**`);
  userConfirmationMessage.setColor('#50c0bf');

  userConfirmationMessage.description = `Click the invite to join your teammates on your new team server.`;

  const discordUser = client.users.resolve(user.userSnowflake);
  if (!discordUser) throw new Error('failed to send invite DM');

  await discordUser.send({
    content: `https://discord.gg/${newServerInvite}`,
    embeds: [userConfirmationMessage],
  });

  // also sends a notification to the original team
  const teamConfirmationMessage = new MessageEmbed();
  teamConfirmationMessage.setTitle(`Accepted Invitation`);
  teamConfirmationMessage.setColor('#50c0bf');

  teamConfirmationMessage.description =
    `**${discordUser.username}** has accepted your invitation to join the team.` +
    `They should have received an invite to join the team server and should join shortly.`;

  const teamChannel = await client.channels.fetch(newTeam.textChannelSnowflake);
  if (!teamChannel?.isText()) throw new Error('failed to send notification to original team');

  await teamChannel.send({
    embeds: [teamConfirmationMessage],
  });
}
