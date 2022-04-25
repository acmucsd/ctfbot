import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByChannelContext } from '../../../../../util/ResourceManager';

export default {
  name: 'del',
  description: 'Deletes a field attached to this challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'index',
      description: 'Indicate which field you want to delete (counting starts at 1)',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByChannelContext(interaction.channel);

    const fields = await challenge.getChallengeFields({ order: [['createdAt', 'ASC']] });
    const index = interaction.options.getNumber('index', true) - 1;

    if (!fields || !fields[index]) throw new Error('no field with that index');
    await fields[index].destroy();

    return `Field #${index + 1} has been removed from challenge **${challenge.name}**.`;
  },
} as ExecutableSubCommandData;
