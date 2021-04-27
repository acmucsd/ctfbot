import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'del',
  description:
    'Removes the indicated challenge. Otherwise, the challenge is inferred from the current channel',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
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

    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.deleteChallenge(interaction.client);

    return `The challenge **${challenge.row.name}** has been deleted.`;
  },
};
