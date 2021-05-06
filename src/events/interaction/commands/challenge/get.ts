import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';
import { UnknownChallengeError } from '../../../../errors/UnknownChallengeError';

export default {
  name: 'get',
  description: 'Gives info on the indicated challenge, and if none is specified returns all challenges in the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'challenge_channel',
      description: 'The challenge to get info on',
      type: ApplicationCommandOptionType.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const challengeChannelSnowflake = options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake) throw new UnknownChallengeError();

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    const category = await challenge.getCategory();

    const attachments = await challenge.getAllAttachments();

    // complicated embedded response
    await interaction.reply({
      embeds: [
        {
          title: challenge.row.name,
          description: challenge.row.prompt,
          fields: [
            ...attachments.map((attach) => ({ name: attach.row.name, value: attach.row.url })),
            {
              name: 'minimum_points',
              value: challenge.row.min_points || '0',
              inline: true,
            },
            {
              name: 'initial_points',
              value: challenge.row.initial_points || '0',
              inline: true,
            },
            {
              name: 'solves until minimum',
              value: challenge.row.point_decay || '0',
              inline: true,
            },
            {
              name: 'flag',
              value: `||${challenge.row.flag}||`,
              inline: true,
            },
          ],
          author: {
            name: `${category.row.name} - ${challenge.row.difficulty}`,
          },
          footer: {
            text: `By ${challenge.row.author}`,
          },
          timestamp: new Date(),
        },
      ],
    });
  },
};
