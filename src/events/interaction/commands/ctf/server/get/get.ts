import CommandInteraction from '../../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../../../compat/types';

export default {
  name: 'get',
  description: 'Lists all of the team servers belonging to the indicated CTF (defaults to current guild\'s CTF)',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: 3,
      required: false,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
