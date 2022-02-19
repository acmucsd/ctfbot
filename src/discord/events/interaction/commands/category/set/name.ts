import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../../util/ResourceManager';
import { createDiscordNullError } from '../../../../../../errors/DiscordNullError';

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
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw createDiscordNullError('ctf');

    const categoryName = interaction.options.getString('category_name', true);
    const newName = interaction.options.getString('new_name', true);

    const categories = await ctf.getCategories({ where: { name: categoryName } });
    if (!categories || !categories[0]) throw new Error('no category by that name');

    categories[0].name = newName;
    await categories[0].save();

    return `Category **${categoryName}** name has been set to **${newName}**.`;
  },
} as ExecutableSubCommandData;
