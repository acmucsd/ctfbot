import CommandInteraction from '../../compat/CommandInteraction';
import { CommandOptionMap } from '../../compat/types';

export default {
  name: 'add',
  description: 'Creates a new CTF in the current guild',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: 3,
      required: true,
    },
    {
      name: 'description',
      description: 'An optional description of the CTF',
      type: 3,
      required: false,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (/ctf add) has not been implemented yet, but you provided ${JSON.stringify(options)}`;
  },
};
