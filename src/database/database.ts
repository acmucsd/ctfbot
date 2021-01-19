import { Pool } from 'pg';
import log from '../log';

import { postgresConfig } from '../config';
import schemas from './schemas';

const pool = new Pool(postgresConfig);

// initialize each table
schemas.forEach((schema) => {
  pool.query(schema).then().catch((err) => {
    log('unable to initialize table: ', err);
    process.exit(1);
  });
});

export default (text: string, params?) => pool.query(text, params);
