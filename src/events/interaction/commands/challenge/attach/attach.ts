import get from './get';
import add from './add';
import del from './del';
import { ApplicationCommandOptionType } from '../../../compat/types';

export default {
  name: 'attach',
  description: 'Challenge attachment management',
  type: ApplicationCommandOptionType.SUB_COMMAND_GROUP,
  options: [get, add, del],
};
