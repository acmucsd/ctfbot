import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';

export default {
  name: 'invite',
  description: 'Invites the indicated user to join your team. You must be Team Captain to do this',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'user',
      description: 'The user to invite',
      type: ApplicationCommandOptionType.USER,
      required: true,
    },
  ],
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
