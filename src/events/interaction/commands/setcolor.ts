import { CTF } from '../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'setcolor',
  description: "Changes the team's role color",
  options: [
    {
      name: 'color',
      description: 'The desired hex code in the format of "AB121F"',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);
    return await team.setColor(interaction.client, interaction.options.getString('color', true));
  },
} as ChatInputCommandDefinition;
