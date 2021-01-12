import { native } from 'pg';

import config from './config';

const pool = new native.Pool(config.pg);
export default pool;
