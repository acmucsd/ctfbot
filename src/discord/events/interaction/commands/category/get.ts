import { CTF } from '../../../../../database/models';
import { PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'get',
  description: 'Lists all challenges within the category. If none is specified, lists all categories within the CTF.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The category name',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    // no admin check ctf.throwErrorUnlessAdmin(interaction);

    const name = interaction.options.getString('name');

    // list all categories
    if (!name) {
      const categories = (await ctf.getAllCategories()).map((cat) => `**${cat.row.name}**`).join();
      return `**${ctf.row.name}** has the following categories: ${categories}`;
    }

    // otherwise, list all challenges in a category
    const category = await ctf.fromNameCategory(name);
    const challenges = (await category.getAllChallenges()).map((chal) => `**${chal.row.name}**`).join();
    return `**${category.row.name}** has the following challenges: ${challenges}`;
  },
};
