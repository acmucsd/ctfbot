import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByChannelContext } from '../../../../../util/ResourceManager';

export default {
  name: 'add',
  description: 'Add a new flag to this challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'flag_text',
      description: "The flag's secret text",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'points',
      description: 'The number of points this flag is worth',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByChannelContext(interaction.channel);

    await challenge.createFlag({
      flagText: interaction.options.getString('flag_text', true),
      pointValue: interaction.options.getNumber('points') || 0,
    });

    return `Flag has been added to challenge **${challenge.name}**.`;
  },
} as ExecutableSubCommandData;
