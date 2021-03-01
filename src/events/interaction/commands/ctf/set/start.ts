import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';

export default {
  name: 'start',
  description: 'Set the start date for the CTF. If no date is indicated, sets it to now',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'start_date',
      description: 'The desired start date in a \'May 26, 2002 06:24:00\' format',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
