import { Message } from 'discord.js';
import { discordConfig } from '../../config';
import { ping } from './commands';

const { prefix } = discordConfig;

const messageEvent = (message: Message) => {
  if (!message.content.startsWith(prefix)) return;

  const args: string[] = message.content.substr(prefix.length).trim().split(' ');
  const command: string = args[0].toLowerCase();

  switch (command) {
    case 'ping':
      ping(message);
      return;
    default:
      message.channel.send(`Command ${command} not recognized`).then(() => {}).catch(() => {});
  }
};

export default messageEvent;
