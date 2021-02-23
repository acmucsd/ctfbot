import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'join',
  description: 'Sends a request to join the indicated team.',
  type: 1,
  options: [
    {
      name: 'team_name',
      description: 'The team you wish to join',
      type: 3,
      required: true,
    },
  ],
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
