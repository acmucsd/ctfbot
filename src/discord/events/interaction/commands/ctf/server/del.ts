import { CTF, TeamServer } from '../../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'del',
  description: 'Removes the indicated team server from the indicated CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The name of the team server',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
    {
      name: 'ctf_name',
      description: 'The name of the CTF to remove the guild from',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    let teamServer: TeamServer;
    let ctf: CTF;

    const name = interaction.options.getString('name');
    const ctf_name = interaction.options.getString('ctf_name');

    if (name) {
      ctf = await (ctf_name ? CTF.fromNameCTF(ctf_name) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));
      teamServer = await ctf.fromNameTeamServer(name);
    } else {
      teamServer = await CTF.fromTeamServerGuildSnowflakeTeamServer(interaction.guild.id);
      ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    }
    ctf.throwErrorUnlessAdmin(interaction);
    await teamServer.deleteTeamServer(interaction.client);
    return `Removed **${teamServer.row.name}** from CTf **${ctf.row.name}**`;
  },
} as ExecutableSubCommandData;
