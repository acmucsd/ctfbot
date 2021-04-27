import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'add',
  description: 'Creates a new CTF challenge.',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: "The challenge's name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'category',
      description: "The challenge's category",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const category = await ctf.fromNameCategory(options.category.toString());
    const challenge = await category.createChallenge(
      interaction.client,
      options.name.toString(),
    );

    return `Challenge **${challenge.row.name}** has been created in category **${category.row.name}**.`;
  },
};
