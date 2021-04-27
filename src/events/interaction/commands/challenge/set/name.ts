import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';

export default {
  name: 'name',
  description: 'Changes the name of the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'new_name',
      description: "The challenge's new name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
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

    const newName = options.new_name.toString();
    const challengeChannelSnowflake =
      options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.setName(interaction.client, newName);

    return `Challenge name has been set to **${newName}**.`;
  },
};
