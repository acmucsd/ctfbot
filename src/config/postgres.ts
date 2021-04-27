const postgres = {
  user: process.env.PGUSER || 'ctfbot',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'ctfbot',
  password:
    process.env.PGPASSWORD || 'dAf1bjOwYUrVse8DsAZZBh2fkxXQwAbGrmE7EHUA',
  port: Number(process.env.PGPORT) || 5432,
};

export default postgres;
