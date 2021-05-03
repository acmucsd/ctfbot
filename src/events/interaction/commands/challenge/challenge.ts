import add from './add';
import attach from './attach';
import del from './del';
import get from './get';
import set from './set';
import submit from './submit';

export default {
  name: 'challenge',
  description: 'Challenge management and submission',
  options: [add, attach, del, get, set, submit],
  default_permission: false,
};
