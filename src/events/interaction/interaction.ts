import { Client } from 'discord.js';
import {
  category, challenge, ctf, scoreboard, team,
} from './commands';
import CommandInteraction from './compat/CommandInteraction';
import log from '../../log';
import { createCommand } from './compat/commands';

export const interactionEvent = (interaction: CommandInteraction) => {
  if (interaction.type === 2) {
    // eslint-ignore-next-line
    switch (interaction.commandName) {
      case ('category'):
        // category(interaction);
        break;
      case ('challenge'):
        // challenge(interaction);
        break;
      case ('ctf'):
        // ctf(interaction);
        break;
      case ('scoreboard'):
        // scoreboard(interaction);
        break;
      case ('team'):
        // team(interaction);
        break;
      default:
        log('no interactions found');
        break;
    }
  }
};

export const registerCommands = async (client: Client) => {
  log('registering commands...');
  await createCommand(client, {
    name: 'ping',
    description: 'sends a ping command',
    options: [],
  });
  log('commands registered');
};
