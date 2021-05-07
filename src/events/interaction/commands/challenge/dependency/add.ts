import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';

export default {
  name: 'add',
  description: 'Adds a prerequisite challenge to the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to add a dependency/prerequisite to',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: 'The challenge to add as a dependency/prerequisite',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {},
};
