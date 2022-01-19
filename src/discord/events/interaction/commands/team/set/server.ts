import { CTF, Team } from '../../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'server',
  description: 'Changes the server the team belongs to',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'server_name',
      description: 'The name of the server to move the team to',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to move',
      type: ApplicationCommandOptionTypes.ROLE,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const teamRole = interaction.options.getRole('team_role');
    const team = teamRole
      ? await ctf.fromRoleTeam(teamRole.id)
      : await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);

    const teamServer = ctf.fromNameTeamServer(interaction.options.getString('server_name', true));
    await team.setTeamServerID(interaction.client, (await teamServer).row.id);
    return `Moved **${team.row.name}** to **${(await teamServer).row.name}**`;
  },
} as ExecutableSubCommandData;
