import { Pool } from 'pg';
import { postgresConfig } from '../config';

import initTables from './schemas';
import { logger } from '../log';

const pool = new Pool(postgresConfig);

// initialize each table
initTables(pool)
  .then(() => logger.info('tables initialized'))
  .catch((err) => {
    logger.info('database initialization failed', err);
    process.exit(1);
  });

export default async (text: string, params?: any[]) => pool.query(text, params);
