import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import { CTF, Team } from '../../../../database/models';

export default {
  name: 'del',
  description: 'Removes the indicated team from the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'team_role',
      description: 'The team to remove',
      type: ApplicationCommandOptionType.ROLE,
      required: false,
    },
  ],
  // async
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    let teamToDelete: Team;
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    if (options) {
      teamToDelete = await ctf.fromRoleTeam(options.team_role as string);
    } else {
      teamToDelete = await ctf.fromUnspecifiedTeam(interaction.member.id, interaction.channel.id);
    }
    await teamToDelete.deleteTeam(interaction.client);
  },
} as ApplicationCommandDefinition;
