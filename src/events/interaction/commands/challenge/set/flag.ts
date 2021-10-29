import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'flag',
  description: "Sets the challenge's flag",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'flag',
      description: "The challenge's flag",
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
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const newFlag = interaction.options.getString('flag', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setFlag(newFlag);

    return `Challenge flag has been set to **${newFlag}**.`;
  },
} as ExecutableSubCommandData;
