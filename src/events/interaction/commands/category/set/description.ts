import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'description',
  description: 'Changes the description of the indicated category',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'category_name',
      description: 'The current category name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'description',
      description: 'The new category description',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const category = await ctf.fromNameCategory(options.category_name.toString());
    await category.setDescription(options.description.toString());

    return `Category **${category.row.name}** description has been set to **${category.row.description}**.`;
  },
};
