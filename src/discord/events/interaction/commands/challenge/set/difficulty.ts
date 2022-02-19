import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByInteraction } from '../../../../../util/ResourceManager';

export default {
  name: 'difficulty',
  description: 'Sets the difficulty of the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'difficulty',
      description: "The challenge's difficulty",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
      choices: [
        {
          name: 'Educational',
          value: 'EDUCATIONAL',
        },
        {
          name: 'Easy',
          value: 'EASY',
        },
        {
          name: 'Medium',
          value: 'MEDIUM',
        },
        {
          name: 'Hard',
          value: 'HARD',
        },
      ],
    },
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByInteraction(interaction);
    const newDifficulty = interaction.options.getString('difficulty', true);

    challenge.difficulty = newDifficulty;
    await challenge.save();

    return `Challenge difficulty has been set to **${newDifficulty}**.`;
  },
} as ExecutableSubCommandData;
