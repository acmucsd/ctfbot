import { TeamServer } from '../../database2/models/TeamServer';
import { createDatabaseNullError } from '../../errors/DatabaseNullError';
import { Client } from 'discord.js';
import { Challenge } from '../../database2/models/Challenge';
import { refreshChallengeChannel } from './ChallengeChannelHooks';
import { ChallengeChannel } from '../../database2/models/ChallengeChannel';

export async function refreshAllChallenges(teamServer: TeamServer, client: Client<true>) {
  const ctf = await teamServer.getCTF({ include: Challenge });
  if (ctf.Challenges) await Promise.all(ctf.Challenges.map((chal) => refreshChallenge(chal, client)));
}

export async function refreshChallenge(challenge: Challenge, client: Client<true>) {
  const ctf = await challenge.getCTF({
    attributes: [],
    include: {
      model: TeamServer,
      attributes: ['id'],
      include: [
        {
          model: ChallengeChannel,
          attributes: ['id'],
          include: [
            {
              model: Challenge,
              attributes: ['id'],
              required: true,
              where: { id: challenge.id },
            },
          ],
        },
      ],
    },
  });
  if (!ctf.TeamServers) throw createDatabaseNullError('ctf.teamServers');

  const channels = await challenge.getChallengeChannels();

  // filter out teamservers that already have a channel for this challenge
  const teamServersToAddTo = ctf.TeamServers.filter((ts) => !ts.ChallengeChannels || ts.ChallengeChannels.length === 0);

  // create new challenge channels for the team servers that need it
  for (const teamServer of teamServersToAddTo) {
    const challengeChannel = ChallengeChannel.build();
    await challengeChannel.setTeamServer(teamServer, { save: false });
    await challengeChannel.setChallenge(challenge, { save: false });
    await challengeChannel.save();
  }

  // now we want to trigger a refresh of our dependant challengeChannels as well
  await Promise.all(channels.map((chan) => refreshChallengeChannel(chan, client)));
}

// mainly we just need to destroy all category channels first
export async function destroyChallenge(challenge: Challenge) {
  const channels = await challenge.getChallengeChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
