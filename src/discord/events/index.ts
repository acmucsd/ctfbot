import { Client } from 'discord.js';
import { logger } from '../../log';
import { interactionEvent, registerCommands } from './interaction/interaction';
import rateLimitEvent from './rateLimit';
import { initHooks } from '../hooks';
import { handleGuildMemberAdd } from './guildMemberAdd';

export const eventLoader = (client: Client) => {
  client.on('rateLimit', (rateLimitInfo) =>
    rateLimitEvent(rateLimitInfo.timeout, rateLimitInfo.limit, rateLimitInfo.method, rateLimitInfo.path),
  );
  client.on('ready', async (client) => {
    logger.info('ready event received');
    await registerCommands(client);
    await initHooks(client);
    //initializePeriodicUpdate(client);

    client.on('guildMemberAdd', (member) => handleGuildMemberAdd(member, client));

    client.on('interactionCreate', (interaction) => interactionEvent(interaction));
  });
};
