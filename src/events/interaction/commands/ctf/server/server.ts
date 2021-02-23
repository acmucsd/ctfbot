import { get, add, del } from '.';
import { ApplicationCommandDefinition } from '../../../compat/types';

export default {
  name: 'server',
  description: 'Management for the team servers',
  type: 2,
  options: [
    get,
    add,
    del,
  ],
} as ApplicationCommandDefinition;
