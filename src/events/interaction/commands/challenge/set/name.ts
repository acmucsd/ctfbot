import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'name',
  description: 'Changes the name of the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'new_name',
      description: "The challenge's new name",
      type: ApplicationCommandOptionTypes.STRING,
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

    const newName = interaction.options.getString('new_name', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel') ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setName(interaction.client, newName);

    return `Challenge name has been set to **${newName}**.`;
  },
} as ExecutableSubCommandData;
