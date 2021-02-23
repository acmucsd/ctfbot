import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF, Team } from '../../../../database/models';

export default {
  name: 'del',
  description: 'Removes the indicated team from the CTF',
  type: 1,
  options: [
    {
      name: 'team_role',
      description: 'The team to remove',
      type: 8,
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
