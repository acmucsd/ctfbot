import CommandInteraction from '../../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandResponseOption } from '../../../../compat/types';

export default {
  name: 'description',
  description: 'Set the description of the CTF',
  type: 1,
  options: [
    {
      name: 'description',
      description: 'The desired description',
      type: 3,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: ApplicationCommandResponseOption) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
