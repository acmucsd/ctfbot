import { CTF } from '../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'setname',
  description: "Changes the team's name",
  default_permission: false,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);

    const team = await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);
    const oldName = team.row.name;

    await team.setName(interaction.client, interaction.options.getString('name', true));

    return `Changed **Team ${oldName}**'s name to **Team ${interaction.options.getString('name', true)}**`;
  },
} as ChatInputCommandDefinition;
