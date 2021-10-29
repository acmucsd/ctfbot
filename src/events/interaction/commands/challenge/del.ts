import { CTF } from '../../../../database/models';
import { UnknownChallengeError } from '../../../../errors/UnknownChallengeError';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

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
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const challengeChannelSnowflake = interaction.options.getChannel('challenge_channel')?.id ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.deleteChallenge(interaction.client);

    return `The challenge **${challenge.row.name}** has been deleted.`;
  },
} as ExecutableSubCommandData;
