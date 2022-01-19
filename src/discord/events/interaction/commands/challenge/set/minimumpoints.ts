import { CTF } from '../../../../../../database/models';
import { UnknownChallengeError } from '../../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'minimumpoints',
  description: "Sets the challenge's minimum points",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'points',
      description: 'The desired points',
      type: ApplicationCommandOptionTypes.INTEGER,
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
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const newPoints = interaction.options.getNumber('points', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setMinPoints(interaction.client, newPoints);

    return `Challenge minimum points has been set to **${newPoints}**.`;
  },
} as ExecutableSubCommandData;
