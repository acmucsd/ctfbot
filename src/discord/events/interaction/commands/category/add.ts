import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'add',
  description: 'Creates a new category with the indicated name and description.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'description',
      description: 'The desired category description',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const name = interaction.options.getString('name', true);
    const description = interaction.options.getString('description');
    const category = await ctf.createCategory(interaction.client, name);
    if (description) await category.setDescription(description);

    return `New category **${name}** has been created.`;
  },
} as ExecutableSubCommandData;
