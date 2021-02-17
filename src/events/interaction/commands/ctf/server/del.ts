import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../../compat/types';

export default {
  name: 'del',
  description: 'Removes the indicated team server from the indicated CTF',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the team server',
      type: 3,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
