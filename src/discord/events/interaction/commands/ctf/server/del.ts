import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { TeamServer } from '../../../../../../database2/models/TeamServer';

export default {
  name: 'del',
  description: 'Removes the current team server from the indicated CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [],
  async execute(interaction: PopulatedCommandInteraction) {
    const teamServer = await TeamServer.findOne({ where: { guildSnowflake: interaction.guild.id } });
    if (!teamServer) throw Error('this guild does not belong to any CTF as a team server');

    const ctf = await teamServer.getCTF();

    const { name } = teamServer;
    await teamServer.destroy();

    return `Removed team server **${name}** from CTF **${ctf.name}**`;
  },
} as ExecutableSubCommandData;
