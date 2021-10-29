import name from './name';
import description from './description';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';

export default {
  name: 'set',
  description: 'Category info management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [name, description],
} as ExecutableSubGroupData;
