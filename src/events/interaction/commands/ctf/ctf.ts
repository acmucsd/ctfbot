import add from './add';
import announce from './announce';
import del from './del';
import server from './server';
import set from './set';
import { ApplicationCommandDefinition } from '../../compat/types';

export default {
  name: 'ctf',
  description: 'Add or manage aspects of CTFs',
  options: [add, announce, del, server, set],
  default_permission: false,
} as ApplicationCommandDefinition;
