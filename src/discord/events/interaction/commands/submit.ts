import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { debounceChallengeChannelUpdates, debounceScoreboardUpdates } from '../../../util/UpdateDebouncer';

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

    const flag = await ctf.getFlag(interaction.options.getString('flag', true));
    if (!flag) throw new Error('Invalid flag. Checking for trailing spaces and typos.');
    const challenge = await flag.getChallenge();

    // update the challenge channels, but in a debounced fashion
    debounceChallengeChannelUpdates(challenge, interaction.client);
    // same with all the scoreboards
    const scoreboards = await ctf.getScoreboards({ attributes: ['id'] });
    scoreboards.forEach((scoreboard) => debounceScoreboardUpdates(scoreboard, interaction.client));

    return 'to be implemented';
  },
} as ChatInputCommandDefinition;
