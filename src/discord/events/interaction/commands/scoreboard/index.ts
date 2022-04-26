import add from './add';
import del from './del';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'scoreboard',
  description: 'Scoreboard management',
  options: [add, del],
  default_permission: false,
} as ChatInputCommandDefinition;
