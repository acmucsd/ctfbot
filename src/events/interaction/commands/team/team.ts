import add from './add';
import del from './del';
import get from './get';
import invite from './invite';
import join from './join';
import set from './set';
import user from './user';
import { ApplicationCommandDefinition } from '../../compat/types';

export default {
  name: 'team',
  description: 'Team management commands',
  options: [add, del, get, invite, join],
} as ApplicationCommandDefinition;
