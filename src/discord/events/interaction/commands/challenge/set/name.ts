import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { getChallengeByInteraction } from '../../../../../util/ResourceManager';

export default {
  name: 'name',
  description: 'Changes the name of the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'new_name',
      description: "The challenge's new name",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
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
    const newName = interaction.options.getString('new_name', true);

    challenge.name = newName;
    await challenge.save();

    return `Challenge name has been set to **${newName}**.`;
  },
} as ExecutableSubCommandData;
