import CommandInteraction from '../../compat/CommandInteraction';
import { CommandOptionMap } from '../../compat/types';

export default {
  name: 'del',
  description: 'Causes the removal of the current guild\'s CTF and all associated Teams, Categories, and Challenges.',
  type: 1,
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
};
