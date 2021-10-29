import { CTF, Team } from '../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'del',
  description: 'Removes the indicated team from the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'team_role',
      description: 'The team to remove',
      type: ApplicationCommandOptionTypes.ROLE,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    let teamToDelete: Team;
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const teamRole = interaction.options.getRole('team_role');

    if (teamRole) {
      teamToDelete = await ctf.fromRoleTeam(teamRole.name);
    } else {
      teamToDelete = await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);
    }
    await teamToDelete.deleteTeam(interaction.client);
    return `Deleted team **${teamToDelete.row.name}** from CTF **${ctf.row.name}**`;
  },
} as ExecutableSubCommandData;
