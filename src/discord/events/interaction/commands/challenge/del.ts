import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../util/ResourceManager';
import { ChallengeChannel } from "../../../../../database2/models/ChallengeChannel";
import { Challenge } from "../../../../../database2/models/Challenge";

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

    const challengeChannelSnowflake = interaction.options.getChannel('challenge_channel')?.id ?? interaction.channelId;
    const challengeChannel = await ChallengeChannel.findOne({  attributes: [], where: { channelSnowflake: challengeChannelSnowflake }, include: Challenge });
    if(!challengeChannel || !challengeChannel.Challenge) throw new UnknownChallengeError();

    await challengeChannel.Challenge.destroy();

    return `The challenge **${challengeChannel.Challenge.name}** has been deleted.`;
  },
} as ExecutableSubCommandData;
