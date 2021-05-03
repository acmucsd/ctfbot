import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF, Team } from '../../../../../database/models';

export default {
  name: 'name',
  description: "Changes the team's name",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the name of',
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
    return await team.setName(interaction.client, options.name as string);
  },
} as ApplicationCommandDefinition;
