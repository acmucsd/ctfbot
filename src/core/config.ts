export default {
  pg: {
    user: process.env.PGUSER || 'ctfbot',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'ctfbot',
    password: process.env.PGPASSWORD || 'dAf1bjOwYUrVse8DsAZZBh2fkxXQwAbGrmE7EHUA',
    port: +process.env.PGPORT || 5432,
  },
  discord: {
    token: process.env.DISCORD_TOKEN,
  },
};
