import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCtfByGuildContext } from '../../../../util/ResourceManager';

export default {
  name: 'del',
  description: 'Removes the named scoreboard from the current CTF.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The scoreboard name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this server is not associated with a CTF');

    const scoreboards = await ctf.getScoreboards({ where: { name: interaction.options.getString('name', true) } });
    if (!scoreboards) throw new Error('no scoreboards with that name');

    const name = scoreboards[0].name;
    await scoreboards[0].destroy();

    return `Scoreboard **${name}** has been removed`;
  },
} as ExecutableSubCommandData;
