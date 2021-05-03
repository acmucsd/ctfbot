import del from './del';
import get from './get';
import { ApplicationCommandDefinition } from '../../../compat/types';

export default {
  name: 'server',
  description: 'Management for the team servers',
  type: 2,
  options: [get, del],
} as ApplicationCommandDefinition;
