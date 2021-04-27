import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'del',
  description:
    'Deletes a file attachment from the existing specified challenge.',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'file_name',
      description: 'The name of the attachment',
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

    const challengeChannelSnowflake =
      options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake)
      throw new Error(
        'could not determine challenge, try providing challenge_channel parameter',
      );

    const fileName = options.file_name.toString();

    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    const attachments = await challenge.getAllAttachments();
    const attachment = attachments.find(
      (attach) => attach.row.name === fileName,
    );

    if (!attachment)
      throw new Error('could not find an attachment with that name');

    await attachment.deleteAttachment();

    return `Attachment **${fileName}** has been removed from challenge **${challenge.row.name}**`;
  },
};
