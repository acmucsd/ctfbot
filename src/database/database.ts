import { Pool } from 'pg';
import { postgresConfig } from '../config';

import initTables from './schemas';
import log from '../log';

const pool = new Pool(postgresConfig);

// initialize each table
initTables(pool)
  .then(() => log('tables initialized'))
  .catch((err) => {
    log('database initialization failed', err);
    process.exit(1);
  });

export default (text: string, params?) => pool.query(text, params);
