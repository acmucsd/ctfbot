import CommandInteraction from '../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../compat/types';
import { CTF, TeamServer } from '../../../../database/models';

export default {
  name: 'add',
  description:
    'Creates an empty team in the indicated server (or current server if none is specified)',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: "The team's name",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'server_name',
      description: 'The server to create the team on',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);
    let teamServer: TeamServer;
    if (options.server_name) {
      /** Team server name is specified */ teamServer = await ctf.fromNameTeamServer(
        options.server_name as string,
      );
    } else {
      teamServer = (await ctf.getAllTeamServers()).find(
        (server) => server.row.guild_snowflake === interaction.guild.id,
      );
      if (!teamServer || !(await teamServer.hasSpace())) {
        /** Current guild is full or isn't a team server */ teamServer = await ctf.getTeamServerWithSpace();
      }
    }
    const team = await teamServer.makeTeam(
      interaction.client,
      ctf,
      (options.name as string).trim(),
    );
    return `Made new team **${team.row.name}** in **${teamServer.row.name}**`;
  },
} as ApplicationCommandDefinition;
