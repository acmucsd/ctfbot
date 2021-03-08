import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF, Team } from '../../../../../database/models';

export default {
  name: 'description',
  description: "Changes the team's description",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'description',
      description: 'The desired description',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the description of',
      type: ApplicationCommandOptionType.ROLE,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    let team: Team;
    if (options?.team_role) {
      ctf.throwErrorUnlessAdmin(interaction);
      team = await ctf.fromRoleTeam(options.team_role as string);
    } else {
      team = await ctf.fromUnspecifiedTeam(interaction.user.id, interaction.channel.id);
    }
    return await team.setDescription(options.description as string);
  },
} as ApplicationCommandDefinition;
