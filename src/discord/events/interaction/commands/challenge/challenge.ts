import add from './add';
import del from './del';
import get from './get';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';
import flag from './flag';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, del, get, set, flag],
  default_permission: false,
} as ChatInputCommandDefinition;
