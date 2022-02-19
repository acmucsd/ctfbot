import add from './add';
import del from './del';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';
import flag from './flag';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, del, set, flag],
  default_permission: false,
} as ChatInputCommandDefinition;
