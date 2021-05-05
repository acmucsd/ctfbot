import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import { CTF } from '../../../database/models';

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
    const oldName = team.row.name;

    await team.setName(interaction.client, options.name.toString());

    return `Changed **Team ${oldName}**'s name to **Team ${options.name.toString()}**`;
  },
} as ApplicationCommandDefinition;
