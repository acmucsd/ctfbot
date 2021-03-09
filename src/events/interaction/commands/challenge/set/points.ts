import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'points',
  description: 'Sets both the initial and minimum points',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'points',
      description: 'The desired points',
      type: ApplicationCommandOptionType.INTEGER,
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

    return `This command has not been implemented yet`;
  },
};
