import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF, TeamServer } from '../../../../database/models';

export default {
  name: 'add',
  description: 'Creates an empty team in the indicated server (or current server if none is specified)',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The team\'s name',
      type: 3,
      required: true,
    },
    {
      name: 'server_name',
      description: 'The server to create the team on',
      type: 3,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    let teamServer: TeamServer;
    if (options.server_name) /** Team server name is specified */ {
      teamServer = await ctf.fromNameTeamServer(options.server_name as string);
    } else {
      teamServer = (await ctf.getAllTeamServers()).find((server) => server.row.guild_snowflake === interaction.guild.id);
      if (!teamServer || !(await teamServer.hasSpace())) /** Current guild is full or isn't a team server */ {
        teamServer = await ctf.getTeamServerWithSpace();
      }
      await teamServer.makeTeam(interaction.client, ctf, (options.name as string).trim());
    }
  },
} as ApplicationCommandDefinition;
