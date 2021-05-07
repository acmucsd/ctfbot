import { Client } from 'discord.js';
import { logger } from '../../log';
import CTF from '../../database/models/ctf';

const periodicUpdate = async (client: Client) => {
  logger('Running periodic update...');

  // update challenge channels in every CTF
  const ctfs = await CTF.allCTFs();
  for (const ctf of ctfs) {
    // logger(`Updating challenge channels of ${ctf.row.name}...`);
    // const challenges = await ctf.getAllChallenges();
    // await Promise.all(challenges.map((chal) => chal.updateChallengeChannels(client)));

    logger(`Updating scoreboard channel of ${ctf.row.name}...`);
    await ctf.updateScoreboard(client);
  }

  logger('Periodic update complete');
};

const initializePeriodicUpdate = (client: Client) => {
  logger('Registering periodic update');
  // every two minutes
  setInterval(() => void periodicUpdate(client), 1000 * 60 * 2);
};

export default initializePeriodicUpdate;
