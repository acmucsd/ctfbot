import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByChannelContext } from '../../../../../util/ResourceManager';

export default {
  name: 'points',
  description: 'Reassigns point value to this flag',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'index',
      description: 'Indicate which flag you want to modify (counting starts at 1)',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: true,
    },
    {
      name: 'points',
      description: 'Indicate how many points you want this flag to be worth',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByChannelContext(interaction.channel);

    const flags = await challenge.getFlags({ attributes: ['id'], order: [['createdAt', 'ASC']] });
    const index = interaction.options.getNumber('index', true);

    if (!flags || !flags[index]) throw new Error('no flag with that index');

    flags[index].pointValue = interaction.options.getNumber('points', true);
    await flags[index].save();

    return `Flag #${index} on challenge **${challenge.name}** is now worth **${flags[index].pointValue}** points.`;
  },
} as ExecutableSubCommandData;
