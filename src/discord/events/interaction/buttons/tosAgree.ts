import { ButtonInteraction, TextChannel } from 'discord.js';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { refreshTeam } from '../../../hooks/TeamHooks';
import { sendTeamChannelLandingMessage } from '../../../messages/TeamChannelLandingMessage';

export default async function handleTosAgree(interaction: ButtonInteraction): Promise<string> {
  if (!interaction.inCachedGuild()) throw new Error('tos agreement somehow not in cached guild');

  // first, detect the CTF
  const ctf = await getCtfByGuildContext(interaction.guild);
  if (!ctf) throw new Error('this tos somehow does not belong to a ctf');

  // check to make sure this user is not already on a team somewhere
  if (await ctf.hasUser(interaction.user.id))
    throw new Error('You have already accepted the terms and have been assigned a team server.');

  const teamServer = await ctf.getMostEmptyTeamServer();

  // first, we create a team to host this new user
  const teamName = interaction.member.displayName || interaction.user.username;
  const team = await teamServer.createTeam({ name: teamName });

  // next, we shoot the landing message to the created channel
  const teamChannel = await interaction.client.channels.fetch(team.textChannelSnowflake);
  if (teamChannel instanceof TextChannel) await sendTeamChannelLandingMessage(teamChannel);

  // next, we create a new user and add them to the team
  await team.createUser({ userSnowflake: interaction.user.id });

  // one last refresh on the team to get user added
  await refreshTeam(team, interaction.client);

  return `You have been successfully added to team server <#${teamServer.inviteChannelSnowflake}>.`;
}
