import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../util/ResourceManager';

export default {
  name: 'del',
  description: 'Removes the provided category from the current CTF.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this server is not associated with a CTF');

    const categories = await ctf.getCategories({ where: { name: interaction.options.getString('name', true) } });
    if (!categories) throw new Error('no category with that name');

    const name = categories[0].name;
    await categories[0].destroy();

    return `Category **${name}** has been removed`;
  },
} as ExecutableSubCommandData;
