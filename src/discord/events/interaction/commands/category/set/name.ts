import { CTF } from '../../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'name',
  description: 'Changes the name of the indicated category',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'category_name',
      description: 'The current category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'new_name',
      description: 'The new category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const categoryName = interaction.options.getString('category_name', true);
    const newName = interaction.options.getString('new_name', true);

    const category = await ctf.fromNameCategory(categoryName);
    await category.setName(interaction.client, newName);

    return `Category **${categoryName}** name has been set to **${category.row.name}**.`;
  },
} as ExecutableSubCommandData;
