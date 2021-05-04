import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import { CTF, Team } from '../../../database/models';

export default {
  name: 'setname',
  description: "Changes the team's name",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.id, interaction.channel.id);
    return await team.setName(interaction.client, options.name as string);
  },
} as ApplicationCommandDefinition;
