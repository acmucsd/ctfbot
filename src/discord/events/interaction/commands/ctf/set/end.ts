import { parse } from 'date-fns';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { CTF } from '../../../../../../database/models/CTF';

export default {
  name: 'end',
  description: 'Set the end date for the CTF. If no date is indicated, sets it to now',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'end_date',
      description: "The desired end date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.findOne({ where: { guildSnowflake: interaction.guild.id }, attributes: ['endDate'] });
    if (!ctf) return `This guild is not the main server for any CTFs`;

    const endDate = interaction.options.getString('end_date');
    const date = parse(endDate ?? '', 'yyyy MM dd HH:mm', new Date());
    if (date.toString() === 'Invalid Date') throw new Error('Date provided is not valid');

    ctf.endDate = date;
    await ctf.save();

    return `CTF end date has been changed to **${date.toString()}**`;
  },
} as ExecutableSubCommandData;
