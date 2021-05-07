import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';

export default {
  name: 'remove',
  description: 'Removes a prerequisite challenge from the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to remove a dependency/prerequisite from',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: 'The challenge to remove as a dependency/prerequisite',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {},
};
