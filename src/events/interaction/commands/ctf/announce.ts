import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData } from '../../interaction';
import { CommandInteraction } from 'discord.js';

export default {
  name: 'announce',
  description: 'Posts the message provided to the official CTF #announcements channel',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'message',
      description: 'The message to post to #announcements',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  execute(interaction: CommandInteraction) {
    return `this command (${interaction.commandId}) has not been implemented yet`;
  },
} as ExecutableSubCommandData;
