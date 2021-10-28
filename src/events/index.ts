import { Client } from 'discord.js';
import { logger } from '../log';
import { interactionEvent, registerCommands } from './interaction/interaction';
import { initializePeriodicUpdate } from './periodicUpdate';
import guildMemberAddEvent from './guildMemberAdd';
import guildMemberRemoveEvent from './guildMemberRemove';
import rateLimitEvent from './rateLimit';

export const eventLoader = (client: Client) => {
  client.on('ready', async (client) => {
    logger.info('ready event received');
    await registerCommands(client);
    initializePeriodicUpdate(client);

    // todo: we need to change these from reaction listeners to message components
    //void initializeReactionListeners();

    // client.on('message', (message) => void MessageEvent(message));
    // client.on('messageReactionAdd', (reaction, user) => void messageReactionAddEvent(reaction, user));
    client.on('guildMemberAdd', (member) => void guildMemberAddEvent(member));
    client.on('guildMemberRemove', (member) => guildMemberRemoveEvent(member));
    client.on('rateLimit', (rateLimitInfo) =>
      rateLimitEvent(rateLimitInfo.timeout, rateLimitInfo.limit, rateLimitInfo.method, rateLimitInfo.path),
    );

    client.on('interactionCreate', (interaction) => interactionEvent(interaction));
  });
};
