import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { destroyCTF, refreshCTF } from './CTFHooks';
import { destroyTeamServer, refreshTeamServer } from './TeamServerHooks';
import { TeamServer } from '../../database2/models/TeamServer';
import { Category } from '../../database2/models/Category';
import { destroyCategory, refreshAllCategories, refreshCategory } from './CategoryHooks';
import { CategoryChannel } from '../../database2/models/CategoryChannel';
import { destroyCategoryChannel, refreshCategoryChannel } from './CategoryChannelHooks';
import { Challenge } from '../../database2/models/Challenge';
import { destroyChallenge, refreshAllChallenges, refreshChallenge } from './ChallengeHooks';
import { ChallengeChannel } from '../../database2/models/ChallengeChannel';
import { destroyChallengeChannel, refreshChallengeChannel } from './ChallengeChannelHooks';

export async function initHooks(client: Client<true>) {
  CTF.beforeCreate((ctf) =>
    refreshCTF(ctf, client).catch(async (e) => {
      await destroyCTF(ctf, client);
      throw e;
    }),
  );
  CTF.beforeUpdate((ctf) => refreshCTF(ctf, client));
  CTF.beforeDestroy((ctf) => destroyCTF(ctf, client));

  TeamServer.beforeCreate((ts) =>
    refreshTeamServer(ts, client).catch(async (e) => {
      await destroyTeamServer(ts, client);
      throw e;
    }),
  );
  // special case, when a new TS is created, we have to make sure the corresponding category channels are created
  TeamServer.afterCreate((ts) => refreshAllCategories(ts, client).then(() => refreshAllChallenges(ts, client)));
  TeamServer.beforeUpdate((ts) => refreshTeamServer(ts, client));
  TeamServer.beforeDestroy((ts) => destroyTeamServer(ts, client));

  // this one is after create because we need categoryID to be defined before creating CategoryChannels
  Category.afterCreate((cat) => refreshCategory(cat, client));
  Category.afterUpdate((cat) => refreshCategory(cat, client));
  Category.beforeDestroy((cat) => destroyCategory(cat));

  CategoryChannel.beforeCreate((chan) =>
    refreshCategoryChannel(chan, client).catch(() => destroyCategoryChannel(chan, client)),
  );
  CategoryChannel.beforeUpdate((chan) => refreshCategoryChannel(chan, client));
  CategoryChannel.afterDestroy((chan) => destroyCategoryChannel(chan, client));

  // this one is after create because we need challenge.id to be defined before creating ChallengeChannels
  Challenge.afterCreate((chal) => refreshChallenge(chal, client));
  Challenge.afterUpdate((chal) => refreshChallenge(chal, client));
  Challenge.beforeDestroy((chal) => destroyChallenge(chal));

  ChallengeChannel.beforeCreate((chan) =>
    refreshChallengeChannel(chan, client).catch(async (e) => {
      await destroyChallengeChannel(chan, client);
      throw e;
    }),
  );
  ChallengeChannel.beforeUpdate((chan) => refreshChallengeChannel(chan, client));
  ChallengeChannel.afterDestroy((chan) => destroyChallengeChannel(chan, client));

  // now, everytime we start up, we should just refresh all of our CTFs and TeamServers anyways
  const ctfs = await CTF.findAll();
  await Promise.all(ctfs.map((ctf) => refreshCTF(ctf, client)));
  const teamServers = await TeamServer.findAll();
  await Promise.all(teamServers.map((ts) => refreshTeamServer(ts, client)));
}
