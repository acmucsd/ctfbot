import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF, Team } from '../../../../../database/models';

export default {
  name: 'server',
  description: 'Changes the server the team belongs to',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'server_name',
      description: 'The name of the server to move the team to',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to move',
      type: ApplicationCommandOptionType.ROLE,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);
    let team: Team;
    if (options?.team_role) {
      team = await ctf.fromRoleTeam(options.team_role as string);
    } else {
      team = await ctf.fromUnspecifiedTeam(interaction.user.id, interaction.channel.id);
    }
    const teamServer = ctf.fromNameTeamServer(options.server_name as string);
    await team.setTeamServerID(interaction.client, (await teamServer).row.id);
    return `Moved **${team.row.name}** to **${(await teamServer).row.name}**`;
  },
} as ApplicationCommandDefinition;
