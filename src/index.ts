import { Client, Intents } from 'discord.js';
import { discordConfig } from './config';
import { eventLoader } from './discord/events';
import sequelize from './database';
import { logger } from './log';

if (!discordConfig.token)
  throw new Error('discord token not provided, please set the DISCORD_TOKEN environment variable');

export const client = new Client({
  partials: ['MESSAGE', 'CHANNEL'],
  intents: [Intents.FLAGS.GUILD_MEMBERS, Intents.FLAGS.GUILDS],
});

eventLoader(client);

client
  .login(discordConfig.token)
  .then(() => {
    logger.info('client login was successful');
  })
  .then(() => sequelize.sync())
  .then(() => {
    logger.info('database initialization was successful');
  })
  .catch(() => {
    console.log('initialization failed, aborting');
    process.exit(1);
  });
