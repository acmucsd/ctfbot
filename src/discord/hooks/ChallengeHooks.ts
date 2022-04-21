import { TeamServer } from '../../database/models/TeamServer';
import { Client } from 'discord.js';
import { Challenge } from '../../database/models/Challenge';
import { refreshChallengeChannel } from './ChallengeChannelHooks';
import { ChallengeChannel } from '../../database/models/ChallengeChannel';
import { Category } from '../../database/models/Category';
import { Ctf } from '../../database/models/Ctf';

export async function refreshAllChallenges(teamServer: TeamServer, client: Client<true>) {
  const ctf = await teamServer.getCTF({ include: { model: Category, attributes: ['id'], include: [Challenge] } });
  if (!ctf.Categories) return;

  const challenges = ctf.Categories.flatMap((cat) => cat.Challenges);
  await Promise.all(challenges.map((chal) => chal && refreshChallenge(chal, client)));
}

export async function refreshChallenge(challenge: Challenge, client: Client<true>) {
  const category = await challenge.getCategory({
    attributes: ['id'],
    where: { '$CTF.TeamServers.ChallengeChannels.id$': null },
    include: [
      {
        model: Ctf,
        attributes: ['id'],
        include: [
          {
            model: TeamServer,
            attributes: ['id'],
            include: [
              {
                model: ChallengeChannel,
                attributes: ['id'],
                include: [
                  {
                    model: Challenge,
                    where: { id: challenge.id },
                    attributes: ['id'],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  });

  const ctf = category?.CTF;
  if (ctf?.TeamServers) {
    // create new challenge channels for the team servers that need it
    for (const teamServer of ctf.TeamServers) {
      const challengeChannel = ChallengeChannel.build();
      await challengeChannel.setTeamServer(teamServer, { save: false });
      await challengeChannel.setChallenge(challenge, { save: false });
      await challengeChannel.save();
    }
  }

  // now we want to trigger a refresh of our dependant challengeChannels as well
  const channels = await challenge.getChallengeChannels();
  await Promise.all(channels.map((chan) => refreshChallengeChannel(chan, client).then(() => chan.save())));
}

// mainly we just need to destroy all category channels first
export async function destroyChallenge(challenge: Challenge) {
  const channels = await challenge.getChallengeChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
