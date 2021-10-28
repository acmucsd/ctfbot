import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'name',
  description: 'Set the name of the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
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
    ctf.throwErrorUnlessAdmin(interaction);

    const name = interaction.options.getString('name', true);
    const oldName = ctf.row.name;

    await ctf.setName(name);
    return `CTF name has been changed from **${oldName}** to **${name}**`;
  },
} as ExecutableSubCommandData;
