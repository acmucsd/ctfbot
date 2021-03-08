// eslint-disable-next-line
import { ApplicationCommandDefinition, ApplicationCommandOptionType } from "../../../compat/types";

import color from './color';
import description from './description';
import name from './name';
import server from './server';

export default {
  name: 'set',
  description: 'Edit various aspects of a team',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [color, description, name, server],
} as ApplicationCommandDefinition;
