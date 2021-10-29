import add from './add';
import attach from './attach';
import del from './del';
import get from './get';
import set from './set';
import dependency from './dependency';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, attach, del, get, set, dependency],
  default_permission: false,
} as ChatInputCommandDefinition;
