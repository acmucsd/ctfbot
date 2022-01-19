import { CTF } from '../../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'color',
  description: "Changes the team's role color",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'color',
      description: 'The desired hex code in the format of "AB121F"',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the color of',
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

    return await team.setColor(interaction.client, interaction.options.getString('color', true));
  },
} as ExecutableSubCommandData;
