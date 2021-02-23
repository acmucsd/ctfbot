import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'invite',
  description: 'Invites the indicated user to join your team. You must be Team Captain to do this',
  type: 1,
  options: [
    {
      name: 'user',
      description: 'The user to invite',
      type: 6,
      required: true,
    },
  ],
  // async
  execute(interaction: CommandInteraction, options: CommandOptionMap) {
    return 'a';
  },
} as ApplicationCommandDefinition;
