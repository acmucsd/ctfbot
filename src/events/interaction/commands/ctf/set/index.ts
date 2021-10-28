import admin from './admin';
import description from './description';
import end from './end';
import name from './name';
import start from './start';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubGroupData } from '../../../interaction';

export default {
  name: 'set',
  description: 'Change various aspects of the CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND_GROUP,
  options: [name, description, admin, start, end],
} as ExecutableSubGroupData;
