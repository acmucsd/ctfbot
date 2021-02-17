import name from './name';
import description from './description';
import admin from './admin';
import start from './start';
import end from './end';
import { ApplicationCommandDefinition } from '../../../compat/types';

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
