import { Client } from 'discord.js';
import { logger } from '../../log';
import CTF from '../../database/models/ctf';

export default async (client: Client) => {
  logger.info('Running periodic update...');

  // update challenge channels in every CTF
  const ctfs = await CTF.allCTFs();
  for (const ctf of ctfs) {
    // logger(`Updating challenge channels of ${ctf.row.name}...`);
    // const challenges = await ctf.getAllChallenges();
    // await Promise.all(challenges.map((chal) => chal.updateChallengeChannels(client)));

    logger.debug(`Updating scoreboard channel of ${ctf.row.name}...`);
    await ctf.updateScoreboard(client);
  }

  logger.info('Periodic update complete');
};
