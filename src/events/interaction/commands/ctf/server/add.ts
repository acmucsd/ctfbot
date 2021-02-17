import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../../compat/types';

export default {
  name: 'add',
  description: 'Adds the current guild as a team server for the indicated CTF',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The unique identifier the server will be referred to as',
      type: 3,
      required: true,
    },
    {
      name: 'limit',
      description: 'The max number of teams allowed to be in the server',
      type: 4,
      required: true,
    },
    {
      name: 'ctf_name',
      description: 'The name of the CTF to add the guild to',
      type: 3,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
