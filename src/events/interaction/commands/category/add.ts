import {
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'add',
  description:
    'Creates a new category with the indicated name and description.',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired category name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'description',
      description: 'The desired category description',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const name = options.name.toString();
    const category = await ctf.createCategory(interaction.client, name);
    if (options.description)
      await category.setDescription(options.description.toString());

    return `New category **${name}** has been created.`;
  },
};
