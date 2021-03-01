import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'join',
  description: 'Sends a request to join the indicated team.',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'team_name',
      description: 'The team you wish to join',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
