import { Challenge } from '../../database/models/Challenge';
import { refreshChallenge } from '../hooks/ChallengeHooks';
import { Client } from 'discord.js';
import { Scoreboard } from '../../database/models/Scoreboard';
import { refreshScoreboard } from '../hooks/ScoreboardHooks';

// a hashmap from challenge ids to their timeout ID
const challengeMapping = new Map<number, NodeJS.Timeout>();
// a hashmap from scoreboard ids to their timeout ID
const scoreboardMapping = new Map<number, NodeJS.Timeout>();

// this function will trigger an update to challenge channels... but no more than
// once every two minutes
export function debounceChallengeChannelUpdates(challenge: Challenge, client: Client<true>) {
  debounceAction(challengeMapping, challenge.id, () => void refreshChallenge(challenge, client), 1000 * 120);
}

// this function will trigger an update to scoreboard channels... but no more than
// once every two minutes
export function debounceScoreboardUpdates(scoreboard: Scoreboard, client: Client<true>) {
  debounceAction(scoreboardMapping, scoreboard.id, () => void refreshScoreboard(scoreboard, client), 1000 * 120);
}

// generic debouncing function
// requires a discriminating id of some kind
function debounceAction(hashmap: Map<number, NodeJS.Timeout>, id: number, action: () => void, delayMS: number) {
  const timeout = hashmap.get(id);

  // if there's currently a timeout for this action, just ignore for now
  if (timeout) return;

  // otherwise, kick off the update to happen in however many minutes
  hashmap.set(
    id,
    setTimeout(() => {
      hashmap.delete(id);
      action();
    }, delayMS),
  );
}
