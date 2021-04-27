import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';

export default {
  name: 'author',
  description: "Sets the indicated challenge's author",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'author',
      description: 'The author or authors',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's name",
      type: ApplicationCommandOptionType.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const newAuthor = options.author.toString();
    const challengeChannelSnowflake =
      options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.setAuthor(newAuthor);

    return `Challenge author has been set to **${newAuthor}**.`;
  },
};
