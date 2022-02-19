import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';
import add from './add';
import del from './del';
import points from './points';

export default {
  name: 'flag',
  description: 'Challenge flag management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [add, del, points],
} as ExecutableSubGroupData;
