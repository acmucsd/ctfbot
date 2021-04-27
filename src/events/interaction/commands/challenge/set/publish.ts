import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { parse } from 'date-fns';

export default {
  name: 'publish',
  description:
    'Releases the challenge at the specified time. If no time is specified, publishes the challenge now',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'publish_time',
      description: "The desired publish date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionType.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const challengeChannelSnowflake =
      options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake)
      throw new Error(
        'could not determine challenge, try providing challenge_channel parameter',
      );

    const date = parse(
      options.publish_time?.toString() ?? '',
      'yyyy MM dd HH:mm',
      new Date(),
    );
    if (date.toString() === 'Invalid Date')
      throw new Error('Date provided is not valid');

    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.setPublishTime(date);

    return `Challenge name has been set to **${date.toString()}**.`;
  },
};
