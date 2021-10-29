import { CTF } from '../../../../database/models';
import { UnknownChallengeError } from '../../../../errors/UnknownChallengeError';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'get',
  description: 'Gives info on the indicated challenge, and if none is specified returns all challenges in the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'challenge_channel',
      description: 'The challenge to get info on',
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
    const category = await challenge.getCategory();

    const attachments = await challenge.getAllAttachments();
    const dependencies = await challenge.getChallengeDependencies();

    // complicated embedded response
    await interaction.reply({
      embeds: [
        {
          title: challenge.row.name,
          description: challenge.row.prompt || '',
          fields: [
            ...attachments.map((attach) => ({ name: attach.row.name, value: attach.row.url })),
            {
              name: 'minimum_points',
              value: `${challenge.row.min_points || 0}`,
              inline: true,
            },
            {
              name: 'initial_points',
              value: `${challenge.row.initial_points || 0}`,
              inline: true,
            },
            {
              name: 'solves until minimum',
              value: `${challenge.row.point_decay || 0}`,
              inline: true,
            },
            {
              name: 'flag',
              value: `||${challenge.row.flag ?? 'FLAG UNSET'}||`,
              inline: true,
            },
            {
              name: 'unlocks',
              value: `ids ${dependencies.join(', ')}`,
              inline: false,
            },
          ],
          author: {
            name: `${category.row.name} - ${challenge.row.difficulty ?? 'DIFFICULT UNSET'}`,
          },
          footer: {
            text: `By ${challenge.row.author ?? 'AUTHOR UNSET'}`,
          },
          timestamp: new Date(),
        },
      ],
    });

    return '';
  },
} as ExecutableSubCommandData;
