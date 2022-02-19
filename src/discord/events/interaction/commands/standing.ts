import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'standing',
  description: "Fetch your team's solved challenges and current ranking",
  default_permission: false,
  execute(interaction: PopulatedCommandInteraction) {
    return 'to be implemented';
  },
} as ChatInputCommandDefinition;
