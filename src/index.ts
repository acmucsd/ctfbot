import { Client } from 'discord.js';
import { discordConfig } from './config';
import { eventLoader } from './events';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import database from './database';

export const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  fetchAllMembers: true,
});
export const subscribedMessages = new Map();
export interface subscribedMessageCallback {
  id: number;
  // eslint-disable-next-line
  callback: Function
}
eventLoader(client);

client
  .login(discordConfig.token)
  .then(() => {})
  .catch(() => {});
