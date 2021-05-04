import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import { CTF, Team } from '../../../database/models';

export default {
  name: 'setcolor',
  description: "Changes the team's role color",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'color',
      description: 'The desired hex code in the format of "AB121F"',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.id, interaction.channel.id);
    return await team.setColor(interaction.client, options.color as string);
  },
} as ApplicationCommandDefinition;
