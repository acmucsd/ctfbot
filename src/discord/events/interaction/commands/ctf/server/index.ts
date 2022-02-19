import del from './del';
import get from './get';
import { ExecutableSubGroupData } from '../../../interaction';

export default {
  name: 'server',
  description: 'Management for the team servers',
  type: 2,
  options: [get, del],
} as ExecutableSubGroupData;
