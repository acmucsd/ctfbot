import CommandInteraction from '../../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  CommandOptionMap,
} from '../../../compat/types';

export default {
  name: 'admin',
  description: 'Set the admin role for the CTF',
  type: 1,
  options: [
    {
      name: 'admin_role',
      description: 'The desired role',
      type: 8,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
