import { logger } from '../../log';
import { registerCommands } from '../interaction/interaction';

const readyEvent = (client) => {
  logger('Discord connected');
  void registerCommands(client);
};

export default readyEvent;
