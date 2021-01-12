import { native } from 'pg';

import config from './config';

const pool = new native.Pool(config.pg);
export default {
  query: (text, params, callback) => pool.query(text, params, callback),
};
