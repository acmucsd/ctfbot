import { logger } from '../../log';
import { registerCommands } from '../interaction/interaction';
import initializeReactionListeners from './initializeReactionListeners';

const readyEvent = (client) => {
  logger('Discord connected');
  void registerCommands(client);
  void initializeReactionListeners();
};

export default readyEvent;
