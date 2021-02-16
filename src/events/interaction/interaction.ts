import { Client } from 'discord.js';
import {
  category, challenge, ctf, scoreboard, team, ping,
} from './commands';
import CommandInteraction from './compat/CommandInteraction';
import log from '../../log';
import { createCommand } from './compat/commands';

export const interactionEvent = (interaction: CommandInteraction) => {
  log(JSON.stringify(interaction));
  if (interaction.type === 2) {
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
      case ('ping'):
        ping(interaction);
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
  }, '808487147853447216');
  log('commands registered');
};
