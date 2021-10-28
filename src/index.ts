import { Client, Intents } from 'discord.js';
import { discordConfig } from './config';
import { eventLoader } from './events';
import './database';
import { logger } from './log';

if (!discordConfig.token)
  throw new Error('discord token not provided, please set the DISCORD_TOKEN environment variable');

export const client = new Client({
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
  intents: [Intents.FLAGS.GUILD_MEMBERS],
});

eventLoader(client);

client
  .login(discordConfig.token)
  .then(() => {
    logger.info('client login was successful');
  })
  .catch(() => {
    console.log('login failed, aborting');
    process.exit(1);
  });
