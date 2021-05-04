import { logger } from '../../log/';
import query from '../../database';
import { CTF } from '../../database/models';
import { CTFRow } from '../../database/schemas';

const initializeReactionListeners = async () => {
  logger('Registering TOS reaction listeners...');

  const { rows } = await query(`SELECT * from ctfs`);
  rows.map((row) => new CTF(row as CTFRow)).forEach((ctf) => ctf.registerTOSListener());

  logger('Registered all TOS listeners!');
};

export default initializeReactionListeners;
