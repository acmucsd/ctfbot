import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';
import add from './add';
import del from './del';

export default {
  name: 'field',
  description: 'Challenge field management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [add, del],
} as ExecutableSubGroupData;
