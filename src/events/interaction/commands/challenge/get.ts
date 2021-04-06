import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'get',
  description: 'Gives info on the indicated challenge, and if none is specified returns all challenges in the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'challenge_name',
      description: 'The challenge to get info on',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const challengeChannelSnowflake = options.challenge_channel?.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake)
      throw new Error('could not determine challenge, try providing challenge_channel parameter');

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    const category = await challenge.getCategory();

    // complicated embedded response
    await interaction.reply({
      embeds: [
        {
          title: challenge.row.name,
          description: challenge.row.prompt,
          // fields: attachments
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
