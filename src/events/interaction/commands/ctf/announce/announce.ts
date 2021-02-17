import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandResponseOption } from '../../../compat/types';

export default {
  name: 'announce',
  description: 'Posts the message provided to the official CTF #announcements channel',
  type: 1,
  options: [
    {
      name: 'message',
      description: 'The message to post to #announcements',
      type: 3,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: ApplicationCommandResponseOption) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
};
