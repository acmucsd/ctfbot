import { CTF } from '../../../../../database/models';
import { UnknownChallengeError } from '../../../../../errors/UnknownChallengeError';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'get',
  description: 'Lists all file attachments of the specified challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
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
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    const attachments = await challenge.getAllAttachments();

    await interaction.reply({
      embeds: [
        {
          description: `Challenge **${challenge.row.name}** has ${attachments.length} attachments`,
          fields: attachments.map((attach) => ({
            name: attach.row.name,
            value: attach.row.url,
          })),
          timestamp: new Date(),
        },
      ],
    });

    return '';
  },
} as ExecutableSubCommandData;
