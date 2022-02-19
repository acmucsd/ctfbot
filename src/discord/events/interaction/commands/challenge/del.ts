import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getChallengeByInteraction } from '../../../../util/ResourceManager';

export default {
  name: 'del',
  description: 'Removes the indicated challenge. Otherwise, the challenge is inferred from the current channel',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const challenge = await getChallengeByInteraction(interaction);
    await challenge.destroy();

    return `The challenge **${challenge.name}** has been deleted.`;
  },
} as ExecutableSubCommandData;
