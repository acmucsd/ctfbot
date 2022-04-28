import { ModalSubmitInteraction, TextChannel } from 'discord.js';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { sendTeamFlagCaptureMessage } from '../../../messages/TeamFlagCaptureMessage';
import { debouncedRefreshScoreboard } from '../../../hooks/ScoreboardHooks';
import { debouncedRefreshChallenge } from '../../../hooks/ChallengeHooks';

export async function handleFlagSubmit(interaction: ModalSubmitInteraction<'cached'>): Promise<string> {
  // get the CTF of this guild
  const ctf = await getCtfByGuildContext(interaction.guild);
  if (!ctf) throw new Error('unable to get ctf of current guild');

  // check to make sure user is a part of this ctf
  const { user, team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

  const flagText = interaction.fields.getTextInputValue('flagText');
  const flag = await ctf.getFlag(flagText);

  if (!flag) throw new Error('That is not the correct flag. Check for trailing spaces, typos, etc.');

  // check to make sure this user has not already captured this flag
  if (await flag.hasUser(user)) throw new Error('You have already captured this flag.');

  // grant this user the flag capture
  await flag.addUser(user);
  // update the challenge channels, but in a debounced fashion
  const challenge = await flag.getChallenge({ attributes: ['id'] });
  debouncedRefreshChallenge(challenge.id, interaction.client);
  // same with all the scoreboards
  const scoreboards = await ctf.getScoreboards({ attributes: ['id'] });
  scoreboards.forEach((scoreboard) => debouncedRefreshScoreboard(scoreboard.id, interaction.client));

  // send follow-up message to team channel
  const teamChannel = await interaction.client.channels.fetch(team.textChannelSnowflake);
  if (teamChannel && teamChannel instanceof TextChannel) {
    // stuff for the message
    const challenge = await flag.getChallenge({ attributes: ['name'] });
    const solves = await flag.countUsers();
    const totalPoints = await team.getPoints();
    await sendTeamFlagCaptureMessage(
      teamChannel,
      user.userSnowflake,
      challenge.name,
      flag.pointValue,
      solves,
      totalPoints,
    );
  }

  return 'Flag successfully captured! 🎉';
}
