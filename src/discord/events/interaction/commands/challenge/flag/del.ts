import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByChannelContext } from '../../../../../util/ResourceManager';

export default {
  name: 'del',
  description: 'Deletes a flag attached to this challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'index',
      description: 'Indicate which flag you want to delete (counting starts at 1)',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByChannelContext(interaction.channel);

    const flags = await challenge.getFlags({ order: [['createdAt', 'ASC']] });
    const index = interaction.options.getNumber('index', true) - 1;

    if (!flags || !flags[index]) throw new Error('no flag with that index');
    await flags[index].destroy();

    return `Flag #${index + 1} has been removed from challenge **${challenge.name}**.`;
  },
} as ExecutableSubCommandData;
