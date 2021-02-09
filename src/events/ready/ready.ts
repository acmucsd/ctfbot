import log from '../../log';
import { registerCommands } from '../interaction/interaction';

const readyEvent = (client) => {
  log('Discord connected');
  void registerCommands(client);
};

export default readyEvent;
