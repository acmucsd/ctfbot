import {
  add, announce, del, server, set,
} from '.';
import { ApplicationCommandDefinition } from '../../compat/types';

export default {
  name: 'ctf',
  description: 'Add or manage aspects of CTFs',
  options: [
    add,
    announce,
    del,
    server,
    set,
  ],
} as ApplicationCommandDefinition;
