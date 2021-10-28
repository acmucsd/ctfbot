import { Client } from 'discord.js';
import {
  guildMemberAddEvent,
  guildMemberRemoveEvent,
  interactionEvent,
  MessageEvent,
  messageReactionAddEvent,
  rateLimitEvent,
} from './';
import { logger } from '../log';
import { registerCommands } from './interaction/interaction';
import initializePeriodicUpdate from './ready/initializePeriodicUpdate';

export default (client: Client) => {
  client.on('ready', async (client) => {
    logger.info('ready event received');
    await registerCommands(client);
    initializePeriodicUpdate(client);

    // todo: we need to change these from reaction listeners to message components
    //void initializeReactionListeners();

    client.on('message', (message) => void MessageEvent(message));
    client.on('guildMemberAdd', (member) => void guildMemberAddEvent(member));
    client.on('guildMemberRemove', (member) => void guildMemberRemoveEvent(member));
    client.on('messageReactionAdd', (reaction, user) => void messageReactionAddEvent(reaction, user));
    client.on('rateLimit', (rateLimitInfo) =>
      rateLimitEvent(rateLimitInfo.timeout, rateLimitInfo.limit, rateLimitInfo.method, rateLimitInfo.path),
    );

    client.on('interactionCreate', (interaction) => interactionEvent(interaction));
  });
};
