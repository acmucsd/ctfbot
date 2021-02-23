import { ApplicationCommandDefinition } from '../../../compat/types';
import {
  name, admin, description, end, start,
} from '.';

export default {
  name: 'set',
  description: 'Change various aspects of the CTF',
  type: 2,
  options: [
    name,
    description,
    admin,
    start,
    end,
  ],
} as ApplicationCommandDefinition;
