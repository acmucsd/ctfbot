import del from './del';
import server from './server';
import set from './set';
import { ChatInputCommandDefinition } from '../../interaction';

export default {
  name: 'ctf',
  description: 'Add or manage aspects of CTFs',
  options: [del, server, set],
  default_permission: false,
} as ChatInputCommandDefinition;
