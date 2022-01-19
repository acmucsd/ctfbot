import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'ping',
  description: 'sends a ping command',
  execute(interaction: PopulatedCommandInteraction) {
    return 'pong';
  },
} as ChatInputCommandDefinition;
