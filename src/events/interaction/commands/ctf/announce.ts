import CommandInteraction from '../../compat/CommandInteraction';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOptionType,
  CommandOptionMap,
} from '../../compat/types';

export default {
  name: 'announce',
  description:
    'Posts the message provided to the official CTF #announcements channel',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'message',
      description: 'The message to post to #announcements',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
