import name from './name';
import author from './author';
import prompt from './prompt';
import difficulty from './difficulty';
import points from './points';
import initialpoints from './initialpoints';
import minimumpoints from './minimumpoints';
import pointdecay from './pointdecay';
import flag from './flag';
import publish from './publish';
import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';

export default {
  name: 'set',
  description: 'Challenge info management',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [name, author, prompt, difficulty, points, initialpoints, minimumpoints, pointdecay, flag, publish],
};
