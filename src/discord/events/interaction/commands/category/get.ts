import { CTF } from '../../../../../database/models';
import { PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../util/ResourceManager';
import { Challenge } from '../../../../../database2/models/Challenge';

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
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this server is not associated with a CTF');

    const name = interaction.options.getString('name');

    // list all categories
    if (!name) {
      const categories = await ctf.getCategories({ attributes: ['name'] });
      return `**${ctf.name}** has the following categories: ${categories.map((cat) => `**${cat.name}**`).join(', ')}`;
    }

    // otherwise, list all challenges in a category
    const categories = await ctf.getCategories({ where: { name }, include: { model: Challenge } });
    if (!categories || !categories[0].challenges) throw new Error('no challenges in that category by that name');

    return `**${categories[0].name}** has the following challenges: ${categories[0].challenges
      .map((chal) => `**${chal.name}**`)
      .join(', ')}`;
  },
};
