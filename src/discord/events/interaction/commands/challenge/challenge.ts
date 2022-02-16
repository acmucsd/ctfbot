import add from './add';
import del from './del';
import get from './get';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, del, get, set],
  default_permission: false,
} as ChatInputCommandDefinition;
