import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandResponseOption } from '../../../compat/types';

export default {
  name: 'del',
  description: 'Causes the removal of the current guild\'s CTF and all associated Teams, Categories, and Challenges.',
  type: 1,
  execute(interaction: CommandInteraction, options: ApplicationCommandResponseOption) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
};
