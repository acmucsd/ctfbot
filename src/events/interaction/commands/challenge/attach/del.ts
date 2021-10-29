import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'del',
  description: 'Deletes a file attachment from the existing specified challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'file_name',
      description: 'The name of the attachment',
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

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    const attachments = await challenge.getAllAttachments();
    const attachment = attachments.find((attach) => attach.row.name === fileName);

    if (!attachment) throw new Error('could not find an attachment with that name');

    await attachment.deleteAttachment();
    await challenge.updateChallengeChannels(interaction.client);

    return `Attachment **${fileName}** has been removed from challenge **${challenge.row.name}**`;
  },
} as ExecutableSubCommandData;
