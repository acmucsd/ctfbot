import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { debouncedRefreshChallenge } from '../../../hooks/ChallengeHooks';
import { debouncedRefreshScoreboard } from '../../../hooks/ScoreboardHooks';
import { TextChannel } from 'discord.js';
import { sendTeamFlagCaptureMessage } from '../../../messages/TeamFlagCaptureMessage';
import { Flag } from '../../../../database/models/Flag';

export default {
  name: 'submit',
  description: 'Submits a flag for any challenge',
  default_permission: false,
  options: [
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this guild does not belong to a ctf');

    // check to make sure user is a part of this ctf
    const { user, team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

    const flag = await ctf.getFlag(interaction.options.getString('flag', true));
    if (!flag) throw new Error('Invalid flag. Checking for trailing spaces and typos.');

    const usersThatHaveCaptured = await team.getUsers({
      attributes: [],
      include: { model: Flag, attributes: [], where: { id: flag.id }, required: true },
    });

    // check to make sure this team has not already captured this flag
    if (usersThatHaveCaptured.length > 0) throw new Error('You have already captured this flag.');

    // grant this user the flag capture
    await flag.addUser(user);

    // update the challenge channels, but in a debounced fashion
    const challenge = await flag.getChallenge({ attributes: ['id', 'name'] });
    debouncedRefreshChallenge(challenge.id, interaction.client);
    // same with all the scoreboards
    const scoreboards = await ctf.getScoreboards({ attributes: ['id'] });
    scoreboards.forEach((scoreboard) => debouncedRefreshScoreboard(scoreboard.id, interaction.client));

    // send follow-up message to team channel
    const teamChannel = await interaction.client.channels.fetch(team.textChannelSnowflake);
    if (teamChannel && teamChannel instanceof TextChannel)
      await sendTeamFlagCaptureMessage(teamChannel, team, user, flag, challenge);

    return 'Flag successfully captured! 🎉';
  },
} as ChatInputCommandDefinition;
