import name from './name';
import { ApplicationCommandOptionType } from '../../../compat/types';
import description from './description';

export default {
  name: 'set',
  description: 'Category info management',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [name, description],
};
