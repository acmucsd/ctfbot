import name from './name';
import author from './author';
import prompt from './prompt';
import difficulty from './difficulty';
import flag from './flag';
import publish from './publish';
import { ExecutableSubGroupData } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'set',
  description: 'Challenge info management',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [name, author, prompt, difficulty, flag, publish],
} as ExecutableSubGroupData;
