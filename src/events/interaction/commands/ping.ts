import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../compat/types';

export default {
  name: 'ping',
  description: 'sends a ping command',
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'pong';
  },
} as ApplicationCommandDefinition;
