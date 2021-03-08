import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'name',
  description: 'Changes the name of the indicated category',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'category_name',
      description: 'The current category name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'new_name',
      description: 'The new category name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const category_name = options.category_name.toString();
    const category = await ctf.fromNameCategory(category_name);
    await category.setName(options.new_name.toString());

    return `Category **${category_name}** name has been set to **${category.row.name}**.`;

    return `This command has not yet been implemented`;
  },
};
