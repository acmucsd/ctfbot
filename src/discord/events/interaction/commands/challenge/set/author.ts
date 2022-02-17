import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getChallengeByInteraction } from '../../../../../util/ResourceManager';

export default {
  name: 'author',
  description: "Sets the indicated challenge's author",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'author',
      description: 'The author or authors',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's name",
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByInteraction(interaction);
    const newAuthor = interaction.options.getString('author', true);

    challenge.author = newAuthor;
    await challenge.save();

    return `Challenge author has been set to **${newAuthor}**.`;
  },
} as ExecutableSubCommandData;
