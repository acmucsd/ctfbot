import { logger } from '../../log';
import { registerCommands } from '../interaction/interaction';
import initializeReactionListeners from './initializeReactionListeners';
import initializePeriodicUpdate from './initializePeriodicUpdate';

const readyEvent = (client) => {
  logger('Discord connected');
  void registerCommands(client);
  initializePeriodicUpdate(client);
  void initializeReactionListeners();
};

export default readyEvent;
