import color from './color';
import description from './description';
import name from './name';
import server from './server';
import { ExecutableSubGroupData } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'set',
  description: 'Edit various aspects of a team',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [color, description, name, server],
} as ExecutableSubGroupData;
