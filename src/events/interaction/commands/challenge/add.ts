import { CTF } from '../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'add',
  description: 'Creates a new CTF challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: "The challenge's name",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'category',
      description: "The challenge's category",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const category = await ctf.fromNameCategory(interaction.options.getString('category', true));
    const challenge = await category.createChallenge(interaction.client, interaction.options.getString('name', true));

    return `Challenge **${challenge.row.name}** has been created in category **${category.row.name}**.`;
  },
} as ExecutableSubCommandData;
