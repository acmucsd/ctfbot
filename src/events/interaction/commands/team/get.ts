import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'get',
  description: 'Returns a list of all teams currently in the CTF',
  type: 1,
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
