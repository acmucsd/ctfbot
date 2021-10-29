import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'author',
  description: "Sets the indicated challenge's author",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'author',
      description: 'The author or authors',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's name",
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const newAuthor = interaction.options.getString('author', true);

    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setAuthor(interaction.client, newAuthor);

    return `Challenge author has been set to **${newAuthor}**.`;
  },
} as ExecutableSubCommandData;
