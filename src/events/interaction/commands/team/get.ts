import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';

export default {
  name: 'get',
  description: 'Returns a list of all teams currently in the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
