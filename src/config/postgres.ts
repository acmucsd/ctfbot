import { logger } from '../log';

const postgres = {
  username: process.env.PGUSER || 'ctfbot',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ctfbot',
  password: process.env.PGPASSWORD || 'dAf1bjOwYUrVse8DsAZZBh2fkxXQwAbGrmE7EHUA',
  port: Number(process.env.PGPORT) || 5432,
  // in production, don't log the sql queries
  logging: process.env.NODE_ENV === 'production' ? false : (msg: string) => logger.debug(msg),
};

export default postgres;
