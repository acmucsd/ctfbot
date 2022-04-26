import { Ctf } from '../../database/models/Ctf';
import { Client } from 'discord.js';
import { destroyCtf, refreshCtf } from './CtfHooks';
import { destroyTeamServer, refreshTeamServer } from './TeamServerHooks';
import { TeamServer } from '../../database/models/TeamServer';
import { Category } from '../../database/models/Category';
import { destroyCategory, refreshAllCategories, refreshCategory } from './CategoryHooks';
import { CategoryChannel } from '../../database/models/CategoryChannel';
import { destroyCategoryChannel, refreshCategoryChannel } from './CategoryChannelHooks';
import { Challenge } from '../../database/models/Challenge';
import { destroyChallenge, refreshAllChallenges, refreshChallenge } from './ChallengeHooks';
import { ChallengeChannel } from '../../database/models/ChallengeChannel';
import { destroyChallengeChannel, refreshChallengeChannel } from './ChallengeChannelHooks';
import { Flag } from '../../database/models/Flag';
import { destroyTeam, refreshTeam } from './TeamHooks';
import { Team } from '../../database/models/Team';
import { destroyScoreboard, refreshScoreboard } from './ScoreboardHooks';
import { Scoreboard } from '../../database/models/Scoreboard';

// responsible for hooking Discord side effects into database changes
export async function initHooks(client: Client<true>) {
  Ctf.beforeCreate((ctf) =>
    refreshCtf(ctf, client).catch(async (e) => {
      await destroyCtf(ctf, client);
      throw e;
    }),
  );
  Ctf.beforeUpdate((ctf) => refreshCtf(ctf, client));
  Ctf.beforeDestroy((ctf) => destroyCtf(ctf, client));

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

  // after creating a flag, update challenges and their channels
  Flag.afterCreate((flag) => flag.getChallenge().then((chal) => refreshChallenge(chal, client)));
  Flag.afterUpdate((flag) => flag.getChallenge().then((chal) => refreshChallenge(chal, client)));
  Flag.afterDestroy((flag) => flag.getChallenge().then((chal) => refreshChallenge(chal, client)));

  Team.beforeCreate((team) => refreshTeam(team, client));
  Team.beforeUpdate((team) => refreshTeam(team, client));
  Team.beforeDestroy((team) => destroyTeam(team, client));

  Scoreboard.beforeCreate((scoreboard) => refreshScoreboard(scoreboard, client));
  Scoreboard.beforeUpdate((scoreboard) => refreshScoreboard(scoreboard, client));
  Scoreboard.beforeDestroy((scoreboard) => destroyScoreboard(scoreboard, client));

  // now, everytime we start up, we should just refresh all of our CTFs and TeamServers anyways
  const ctfs = await Ctf.findAll();
  await Promise.all(ctfs.map((ctf) => refreshCtf(ctf, client)));
  const teamServers = await TeamServer.findAll();
  await Promise.all(teamServers.map((ts) => refreshTeamServer(ts, client)));
}
