import { parse } from 'date-fns';

import CommandInteraction from '../../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'start',
  description:
    'Set the start date for the CTF. If no date is indicated, sets it to now',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'start_date',
      description: "The desired start date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const date = parse(
      options.start_date?.toString() ?? '',
      'yyyy MM dd HH:mm',
      new Date(),
    );
    if (date.toString() === 'Invalid Date')
      throw new Error('Date provided is not valid');
    await ctf.setStartDate(date);
    return `CTF start date has been changed to **${date.toString()}**`;
  },
} as ApplicationCommandDefinition;
