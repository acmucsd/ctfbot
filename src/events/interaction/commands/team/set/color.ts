import CommandInteraction from '../../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import { CTF, Team } from '../../../../../database/models';

export default {
  name: 'color',
  description: "Changes the team's role color",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'color',
      description: 'The desired hex code in the format of "AB121F"',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'team_role',
      description: 'The team to set the color of',
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
      // Check if user is a member of the team whose channel they're in
      team = await ctf.fromUnspecifiedTeam(
        interaction.member.id,
        interaction.channel.id,
      );
    }
    return await team.setColor(interaction.client, options.color as string);
  },
} as ApplicationCommandDefinition;
