import { TeamServer } from '../../database2/models/TeamServer';
import { createDatabaseNullError } from '../../errors/DatabaseNullError';
import { Client } from 'discord.js';
import { Challenge } from '../../database2/models/Challenge';
import { refreshChallengeChannel } from './ChallengeChannelHooks';

export async function refreshAllChallenges(teamServer: TeamServer, client: Client<true>) {
  const ctf = await teamServer.getCTF({ include: Challenge });
  if (ctf.Challenges) await Promise.all(ctf.Challenges.map((chal) => refreshChallenge(chal, client)));
}

export async function refreshChallenge(challenge: Challenge, client: Client<true>) {
  const ctf = await challenge.getCTF({ attributes: [], include: { model: TeamServer, attributes: ['id'] } });
  if (!ctf.TeamServers) throw createDatabaseNullError('ctf.teamServers');

  const channels = await challenge.getChallengeChannels();

  for (const teamServer of ctf.TeamServers) {
    if (channels.find((chan) => chan.teamServerId === teamServer.id)) continue;
    // there isn't a category channel for this teamserver + category combo
    // so we gotta create it
    await challenge.createChallengeChannel({ teamServerId: teamServer.id });
  }

  // now we want to trigger a refresh of our dependant categoryChannels as well
  await Promise.all(channels.map((chan) => refreshChallengeChannel(chan, client)));
}

// mainly we just need to destroy all category channels first
export async function destroyChallenge(challenge: Challenge) {
  const channels = await challenge.getChallengeChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
