import add from './add';
import del from './del';
import get from './get';
import join from './join';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'team',
  description: 'Team management commands',
  options: [add, del, get, join, set],
  default_permission: false,
} as ChatInputCommandDefinition;
