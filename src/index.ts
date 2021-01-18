import { Client } from 'discord.js';
import { discordConfig } from './config';
import eventLoader from './events';
import database from './database';

const client = new Client();
eventLoader(client);

client.login(discordConfig.token).then(() => {}).catch(() => {});
