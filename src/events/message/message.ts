import { Message } from 'discord.js';
import { discordConfig } from '../../config';
import logger from '../../log/logger';

const { prefix } = discordConfig;

interface Error {
  message: string
}

const messageEvent = (message: Message) => {
  console.log('To be used later');
};

export default messageEvent;
