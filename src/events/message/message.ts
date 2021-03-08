import { Message } from 'discord.js';
import { discordConfig } from '../../config';

const { prefix } = discordConfig;

interface Error {
  message: string;
}

const messageEvent = (message: Message) => {};

export default messageEvent;
