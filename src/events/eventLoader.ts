import { Client } from 'discord.js';
import readyEvent from './ready';
import messageEvent from './message';

export default (client: Client) => {
  client.on('ready', () => readyEvent(client));
  client.on('message', (message) => void messageEvent(message));
};
