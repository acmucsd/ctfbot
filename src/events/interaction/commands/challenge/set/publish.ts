import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'publish',
  description: 'Releases the challenge at the specified time. If no time is specified, publishes the challenge now',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'publish_time',
      description: "The desired publish date in a 'May 26, 2002 06:24:00' format",
      type: ApplicationCommandOptionType.STRING,
      required: false,
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

    return `This command has not been implemented yet`;
  },
};
