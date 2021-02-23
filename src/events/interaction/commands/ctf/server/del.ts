import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../../compat/types';
import { CTF, TeamServer } from '../../../../../database/models';

export default {
  name: 'del',
  description: 'Removes the indicated team server from the indicated CTF',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the team server',
      type: 3,
      required: false,
    },
    {
      name: 'ctf_name',
      description: 'The name of the CTF to remove the guild from',
      type: 3,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    let teamServer: TeamServer;

    if (options && options.name) {
      const ctf = await ((options.ctf_name) ? CTF.fromNameCTF(options.ctf_name as string) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));
      teamServer = await ctf.fromNameTeamServer(options.name as string);
    } else {
      teamServer = await CTF.fromTeamServerGuildSnowflakeTeamServer(interaction.guild.id);
    }
    void teamServer.deleteTeamServer();
  },
} as ApplicationCommandDefinition;
