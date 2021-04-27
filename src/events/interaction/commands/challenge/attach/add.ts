import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';

export default {
  name: 'add',
  description: 'Adds a file attachment to the existing specified challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'file_name',
      description: 'The name the file will be referred to',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'file_url',
      description: 'The download url for the file',
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
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();

    const fileName = options.file_name.toString();
    const fileURL = options.file_url.toString();
    const challenge = await ctf.fromChannelSnowflakeChallenge(
      challengeChannelSnowflake,
    );
    await challenge.createAttachment(fileName, fileURL);

    return `Attachment **${fileName}** has been added to challenge **${challenge.row.name}**`;
  },
};
