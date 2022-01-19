import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

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
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const name = interaction.options.getString('name', true);
    const category = await ctf.fromNameCategory(name);
    await category.deleteCategory(interaction.client);

    return `Category **${name}** has been removed`;
  },
} as ExecutableSubCommandData;
