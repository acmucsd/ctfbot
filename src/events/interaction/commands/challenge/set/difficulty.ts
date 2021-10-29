import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'difficulty',
  description: 'Sets the difficulty of the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'difficulty',
      description: "The challenge's difficulty",
      type: ApplicationCommandOptionTypes.STRING,
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
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const difficulty = interaction.options.getString('difficulty', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setDifficulty(interaction.client, difficulty);

    return `Challenge difficulty has been set to **${difficulty}**.`;
  },
} as ExecutableSubCommandData;
