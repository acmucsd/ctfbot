import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { Ctf } from '../../../../../../database/models/Ctf';

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
    const ctf = await Ctf.findOne({ where: { guildSnowflake: interaction.guild.id } });
    if (!ctf) return `This guild is not the main server for any CTFs`;

    const name = interaction.options.getString('name', true);
    const oldName = ctf.name;

    ctf.name = name;
    await ctf.save();
    return `CTF name has been changed from **${oldName}** to **${name}**`;
  },
} as ExecutableSubCommandData;
