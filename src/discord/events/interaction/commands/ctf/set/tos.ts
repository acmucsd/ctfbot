import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { Ctf } from '../../../../../../database/models/Ctf';
import axios from 'axios';

export default {
  name: 'tos',
  description: 'Set the Terms of Service of the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'url',
      description: 'URL to the JSON array of embeds to use as the terms of service',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await Ctf.findOne({ where: { guildSnowflake: interaction.guild.id } });
    if (!ctf) return `This guild is not the main server for any CTFs`;

    const url = interaction.options.getString('url', true);
    const response = await axios.get(url);

    // all the schema checks actually happen as hooks, so we can slam this through
    ctf.tosMessage = JSON.stringify(response.data);
    await ctf.save();

    return `CTF Terms of Service have been updated successfully!`;
  },
} as ExecutableSubCommandData;
