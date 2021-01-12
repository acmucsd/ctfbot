import { Pool } from 'pg';

import config from './config';
import schemas from './schemas';

const pool = new Pool(config.pg);

// initialize each table
schemas.forEach((schema) => {
  pool.query(schema).then().catch((err) => {
    console.log('unable to initialize table: ', err);
    process.exit(1);
  });
});

export default {
  query: (text, params, callback) => pool.query(text, params, callback),
};
