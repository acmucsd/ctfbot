import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';

export default {
  name: 'difficulty',
  description: 'Sets the difficulty of the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'difficulty',
      description: "The challenge's difficulty",
      type: ApplicationCommandOptionType.STRING,
      required: true,
      choices: [
        {
          name: 'Baby',
          value: 'BABY',
        },
        {
          name: 'Easy',
          value: 'EASY',
        },
        {
          name: 'Medium',
          value: 'MEDIUM',
        },
        {
          name: 'Hard',
          value: 'HARD',
        },
      ],
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

    const difficulty = options.difficulty.toString();
    const challengeChannelSnowflake = options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setDifficulty(interaction.client, difficulty);

    return `Challenge difficulty has been set to **${difficulty}**.`;
  },
};
