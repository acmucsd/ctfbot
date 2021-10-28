import { logger } from '../../log';
import { registerCommands } from '../interaction/interaction';
import initializeReactionListeners from './initializeReactionListeners';
import initializePeriodicUpdate from './initializePeriodicUpdate';
import { Client } from 'discord.js';

const readyEvent = (client: Client<true>) => {
  logger.info('ready event received');
  void registerCommands(client.application);
  initializePeriodicUpdate(client);
  void initializeReactionListeners();
};

export default readyEvent;
