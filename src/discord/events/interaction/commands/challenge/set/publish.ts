import { CTF } from '../../../../../../database/models';
import { parse } from 'date-fns';
import { UnknownChallengeError } from '../../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'publish',
  description: 'Releases the challenge at the specified time. If no time is specified, publishes the challenge now',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'publish_time',
      description: "The desired publish date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
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

    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const date = parse(interaction.options.getString('publish_time') ?? '', 'yyyy MM dd HH:mm', new Date());
    if (date.toString() === 'Invalid Date') throw new Error('Date provided is not valid');

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setPublishTime(date);

    return `Challenge name has been set to **${date.toString()}**.`;
  },
} as ExecutableSubCommandData;
