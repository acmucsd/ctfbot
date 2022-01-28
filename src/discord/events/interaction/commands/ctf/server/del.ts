import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { CTF } from '../../../../../../database2/models/CTF';

export default {
  name: 'del',
  description: 'Removes the current team server from the indicated CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'ctf_name',
      description: 'The name of the CTF to remove the guild from',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctfname = interaction.options.getString('ctf_name');
    const ctf = await CTF.findOne({ where: { name: ctfname } });
    if (!ctf) throw Error('no CTF by that name');

    const [teamServer] = await ctf.getTeamServers({ where: { guildSnowflake: interaction.guild.id } });
    if (!teamServer) throw Error('this team server does not belong to that CTF');

    const { name } = teamServer;
    await teamServer.destroy();

    return `Removed team server **${name}** from CTF **${ctf.name}**`;
  },
} as ExecutableSubCommandData;
