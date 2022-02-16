import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getChallengeByChannelContext, getCTFByGuildContext } from '../../../../util/ResourceManager';

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
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this discord guild is not associated with any CTF');

    const challengeChannel = interaction.options.getChannel('challenge_channel') || interaction.channel;
    const challenge = await getChallengeByChannelContext(challengeChannel);

    await challenge.destroy();

    return `The challenge **${challenge.name}** has been deleted.`;
  },
} as ExecutableSubCommandData;
