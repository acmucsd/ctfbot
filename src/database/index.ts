import { Sequelize } from 'sequelize';
import { postgresConfig } from '../config';
import { initCtf } from './models/Ctf';

const sequelize = new Sequelize({
  dialect: 'postgres',
  define: {
    underscored: true,
  },
  ...postgresConfig,
});

// this will initialize the CTF model AND all of its child dependants
initCtf(sequelize);

export default sequelize;
