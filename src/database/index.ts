import { Sequelize } from 'sequelize';
import { postgresConfig } from '../config';
import { initCTF } from './models/CTF';

const sequelize = new Sequelize({
  dialect: 'postgres',
  ...postgresConfig,
});

// this will initialize the CTF model AND all of its child dependants
initCTF(sequelize);

export default sequelize;
