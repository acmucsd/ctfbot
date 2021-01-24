import { Message } from 'discord.js';
import { discordConfig } from '../../config';
import { ctf, ping } from './commands';
import logger from '../../log/logger';

const { prefix } = discordConfig;

const messageEvent = (message: Message) => {
  if (!message.content.startsWith(prefix)) return;

  const args: string[] = message.content.substr(prefix.length).trim().split(' ');
  const command: string = args[0].toLowerCase();

  switch (command) {
    case 'ping':
      ping(message);
      break;
    case 'ctf':
      ctf(message, prefix.length).catch((e: Error) => {
        logger(`Error: ${e.message} from command "${message.content}"`);
        void message.channel.send(`Error: ${e.message} from command "${message.content}"`);
      });
      break;
    default:
      void message.channel.send(`Command ${command} not recognized`);
      break;
  }
};

export default messageEvent;
