import add from './add';
import del from './del';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';
import flag from './flag';
import fromcsv from './fromcsv';
import field from './field';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, del, set, flag, fromcsv, field],
  default_permission: false,
} as ChatInputCommandDefinition;
