import get from './get';
import add from './add';
import del from './del';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';

export default {
  name: 'attach',
  description: 'Challenge attachment management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [get, add, del],
} as ExecutableSubGroupData;
