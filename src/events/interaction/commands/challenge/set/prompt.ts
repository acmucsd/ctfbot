import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';

export default {
  name: 'prompt',
  description: "Changes the indicated challenge's prompt",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'prompt',
      description: 'The desired challenge prompt',
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

    const newPrompt = options.prompt.toString();
    const challengeChannelSnowflake =
      options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.setPrompt(newPrompt);

    return `Challenge name has been set to **${newPrompt}**.`;
  },
};
