import { Message } from 'discord.js';
import { discordConfig } from '../../config';
import { ctf, ping } from './commands';
import logger from '../../log/logger';

const { prefix } = discordConfig;

interface Error {
  message: string
}

const messageEvent = async (message: Message) => {
  if (!message.content.startsWith(prefix)) return;

  const args: string[] = message.content.substr(prefix.length).trim().split(' ');
  const command: string = args[0].toLowerCase();

  try {
    switch (command) {
      case 'ping':
        ping(message);
        break;
      case 'ctf':
        await ctf(message, prefix.length);
        break;
      default:
        throw new Error(`Command ${command} not recognized`);
    }
  } catch (e) {
    const err: Error = e as Error;
    logger(`Error: ${err.message} from command "${message.content}"`);
    void message.channel.send(`Error: ${err.message} from command "${message.content}"`);
  }
};

export default messageEvent;
