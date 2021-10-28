import { parse } from 'date-fns';
import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

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
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const endDate = interaction.options.getString('end_date');
    const date = parse(endDate ?? '', 'yyyy MM dd HH:mm', new Date());
    if (date.toString() === 'Invalid Date') throw new Error('Date provided is not valid');

    await ctf.setEndDate(date);
    return `CTF end date has been changed to **${date.toString()}**`;
  },
} as ExecutableSubCommandData;
