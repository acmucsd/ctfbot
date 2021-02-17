import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandResponseOption } from '../../compat/types';

export default {
  name: 'ping',
  description: 'sends a ping command',
  execute(interaction: CommandInteraction, options: ApplicationCommandResponseOption) {
    return 'pong';
  },
} as ApplicationCommandDefinition;
