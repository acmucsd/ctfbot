import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'get',
  description: 'Lists all challenges within the category. If none is specified, lists all categories within the CTF.',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The category name',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    // no admin check ctf.throwErrorUnlessAdmin(interaction);

    // list all categories
    if (!options.name) {
      const categories = (await ctf.getAllCategories()).map((cat) => `**${cat.row.name}**`).join();
      return `**${ctf.row.name}** has the following categories: ${categories}`;
    }

    // otherwise, list all challenges in a category
    const category = await ctf.fromNameCategory(options.name.toString());
    const challenges = (await category.getAllChallenges()).map((chal) => `**${chal.row.name}**`).join();
    return `**${category.row.name}** has the following challenges: ${challenges}`;
  },
};
