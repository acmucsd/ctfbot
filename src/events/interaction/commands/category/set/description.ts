import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'description',
  description: 'Changes the description of the indicated category',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'category_name',
      description: 'The current category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'description',
      description: 'The new category description',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const description = interaction.options.getString('description', true);

    const category = await ctf.fromNameCategory(interaction.options.getString('category_name', true));
    await category.setDescription(description);

    return `Category **${category.row.name}** description has been set to **${description}**.`;
  },
} as ExecutableSubCommandData;
