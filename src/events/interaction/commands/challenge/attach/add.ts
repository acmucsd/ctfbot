import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'add',
  description: 'Adds a file attachment to the existing specified challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'file_name',
      description: 'The name the file will be referred to',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'file_url',
      description: 'The download url for the file',
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

    const challengeChannelSnowflake = interaction.options.getChannel('challenge_channel')?.id ?? interaction.channelId;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();

    const fileName = interaction.options.getString('file_name', true);
    const fileURL = interaction.options.getString('file_url', true);

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.createAttachment(interaction.client, fileName, fileURL);

    return `Attachment **${fileName}** has been added to challenge **${challenge.row.name}**`;
  },
} as ExecutableSubCommandData;
