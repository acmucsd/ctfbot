import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'description',
  description: "Changes the team's description",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'description',
      description: 'The desired description',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the description of',
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

    return await team.setDescription(interaction.options.getString('description', true));
  },
} as ExecutableSubCommandData;
