import { CTF, Team } from '../../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'name',
  description: "Changes the team's name",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the name of',
      type: ApplicationCommandOptionTypes.ROLE,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const teamRole = interaction.options.getRole('team_role');
    if (teamRole) ctf.throwErrorUnlessAdmin(interaction);
    const team = teamRole
      ? await ctf.fromRoleTeam(teamRole.id)
      : await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);

    return await team.setName(interaction.client, interaction.options.getString('name', true));
  },
} as ExecutableSubCommandData;
