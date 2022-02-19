import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../util/ResourceManager';

export default {
  name: 'add',
  description: 'Creates a new category with the indicated name.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this server is not associated with a CTF');

    const category = await ctf.createCategory({ name: interaction.options.getString('name', true) });

    return `New category **${category.name}** has been created.`;
  },
} as ExecutableSubCommandData;
