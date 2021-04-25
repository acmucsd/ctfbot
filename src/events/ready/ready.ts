import { logger } from '../../log';
import { registerCommands } from '../interaction/interaction';
import populateTOSMessages from './PopulateTOSMessages';

const readyEvent = (client) => {
  logger('Discord connected');
  void registerCommands(client);
  void populateTOSMessages();
};

export default readyEvent;
