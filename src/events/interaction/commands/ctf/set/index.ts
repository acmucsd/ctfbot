// eslint-disable-next-line
import { ApplicationCommandDefinition, ApplicationCommandOptionType } from "../../../compat/types";

import admin from './admin';
import description from './description';
import end from './end';
import name from './name';
import start from './start';

export default {
  name: 'set',
  description: 'Change various aspects of the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [name, description, admin, start, end],
} as ApplicationCommandDefinition;
