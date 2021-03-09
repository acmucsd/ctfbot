import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'author',
  description: "Sets the indicated challenge's author",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'author',
      description: 'The author or authors',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'challenge_name',
      description: "The challenge's name",
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
