import add from './add';
import remove from './remove';
import { ApplicationCommandOptionType } from '../../../compat/types';

export default {
  name: 'dependency',
  description: 'Challenge dependency management',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [add, remove],
};
