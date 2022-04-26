import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCtfByGuildContext } from '../../../../util/ResourceManager';
import { Scoreboard } from '../../../../../database/models/Scoreboard';

export default {
  name: 'add',
  description: 'Creates a new scoreboard with the indicated name',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The name of your new scoreboard',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'filterCategory',
      description: 'Only show scores in the named category',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
    {
      name: 'filterMaxTeamSize',
      description: 'Only show teams with this many players or fewer',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: false,
    },
    {
      name: 'filterMinTeamSize',
      description: 'Only show teams with this many players or greater',
      type: ApplicationCommandOptionTypes.NUMBER,
      required: false,
    },
    {
      name: 'group',
      description: 'Indicate whether to show team scores or individual player scores',
      type: ApplicationCommandOptionTypes.STRING,
      choices: [
        {
          name: 'teams',
          value: 'TEAMS',
        },
        {
          name: 'players',
          value: 'PLAYERS',
        },
      ],
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this server is not associated with a CTF');

    const name = interaction.options.getString('name', true);
    const filterCategory = interaction.options.getString('filterCategory');
    const maxTeamSize = interaction.options.getNumber('filterMaxTeamSize') || undefined;
    const minTeamSize = interaction.options.getNumber('filterMinTeamSize') || undefined;
    const group = interaction.options.getString('group') || 'TEAMS';

    // we build instead of save so we can postpone the query until the very end
    const scoreboard = Scoreboard.build({ name, maxTeamSize, minTeamSize, group });
    await scoreboard.setCtf(ctf, { save: false });

    if (filterCategory) {
      const categories = await ctf.getCategories({ attributes: ['id'], where: { name: filterCategory.toUpperCase() } });
      if (categories.length === 0) throw new Error(`Category ${filterCategory} not found`);
      await scoreboard.setCategory(categories[0], { save: false });
    }

    await scoreboard.save();
    return `New scoreboard **${scoreboard.name}** has been created.`;
  },
} as ExecutableSubCommandData;
