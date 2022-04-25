import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByChannelContext } from '../../../../../util/ResourceManager';

export default {
  name: 'add',
  description: 'Add a new field to this challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'title',
      description: "The field's title",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'content',
      description: "The field's content",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByChannelContext(interaction.channel);

    await challenge.createChallengeField({
      title: interaction.options.getString('title', true),
      content: interaction.options.getString('content', true),
    });

    return `Field has been added to challenge **${challenge.name}**.`;
  },
} as ExecutableSubCommandData;
