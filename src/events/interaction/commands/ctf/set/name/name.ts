import CommandInteraction from '../../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandResponseOption } from '../../../../compat/types';

export default {
  name: 'name',
  description: 'Set the name of the CTF',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: 3,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: ApplicationCommandResponseOption) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
