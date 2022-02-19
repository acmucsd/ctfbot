import { parse } from 'date-fns';

import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { CTF } from '../../../../../../database/models/CTF';

export default {
  name: 'start',
  description: 'Set the start date for the CTF. If no date is indicated, sets it to now',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'start_date',
      description: "The desired start date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.findOne({ where: { guildSnowflake: interaction.guild.id }, attributes: ['startDate'] });
    if (!ctf) return `This guild is not the main server for any CTFs`;

    const startDate = interaction.options.getString('start_date');
    const date = startDate ? parse(startDate, 'yyyy MM dd HH:mm', new Date()) : new Date();
    if (date.toString() === 'Invalid Date') throw new Error('Date provided is not valid');

    ctf.startDate = date;
    await ctf.save();

    return `CTF start date has been changed to **${date.toString()}**`;
  },
} as ExecutableSubCommandData;
