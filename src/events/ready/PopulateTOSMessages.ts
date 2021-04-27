import { logger } from '../../log/';
import query from '../../database';
import { subscribedMessages } from '../../index';
import { CTF } from '../../database/models';

const populateTOSMessages = async () => {
  logger('Started caching TOS webhooks...');
  const { rows } = await query(`SELECT * from ctfs`);
  rows.forEach((ctfRow) => {
    new CTF(ctfRow).cacheTOS(subscribedMessages);
  });
  logger('Cached all TOS webhooks!');
};

export default populateTOSMessages;
