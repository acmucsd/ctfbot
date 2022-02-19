import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'setname',
  description: "Changes the team's name",
  default_permission: false,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  execute(interaction: PopulatedCommandInteraction) {
    return 'to be implemented';
  },
} as ChatInputCommandDefinition;
