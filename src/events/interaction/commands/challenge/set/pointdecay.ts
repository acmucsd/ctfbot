import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'pointdecay',
  description: 'Sets the challenges point decay (i.e. number of solves until the minimum point value is reached)',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'decay',
      description: 'Number of solves',
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

    const newDecay = interaction.options.getNumber('decay', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setPointDecay(interaction.client, newDecay);

    return `Challenge point decay has been set to **${newDecay}**.`;
  },
} as ExecutableSubCommandData;
