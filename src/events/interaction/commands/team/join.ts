import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'join',
  description: 'Sends a request to join the indicated team.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'team_name',
      description: 'The team you wish to join',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  execute(interaction: PopulatedCommandInteraction) {
    return 'this command is not implemented';
  },
} as ExecutableSubCommandData;
