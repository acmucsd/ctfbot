import add from './add';
import remove from './remove';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';

export default {
  name: 'dependency',
  description: 'Challenge dependency management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [add, remove],
} as ExecutableSubGroupData;
