import CommandInteraction from '../../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  CommandOptionMap,
} from '../../../compat/types';

export default {
  name: 'start',
  description: 'Set the start date for the CTF. If no date is indicated, sets it to now',
  type: 1,
  options: [
    {
      name: 'start_date',
      description: 'The desired start date in a \'May 26, 2002 06:24:00\' format',
      type: 3,
      required: false,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;