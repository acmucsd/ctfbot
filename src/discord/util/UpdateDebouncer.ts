import { Challenge } from '../../database/models/Challenge';
import { refreshChallenge } from "../hooks/ChallengeHooks";
import { Client } from "discord.js";

// a hashmap from challenge ids to their timeout ID
const mapping = new Map<number, NodeJS.Timeout>();

// this function will trigger an update to challenge channels... but no more than
// once every two minutes
export function debounceChallengeChannelUpdates(challenge: Challenge, client: Client<true>) {
  const timeout = mapping.get(challenge.id);

  // if there's currently a timeout for this challenge, just ignore for now
  if (timeout) return;

  // otherwise, kick off the update to happen in two minutes
  mapping.set(
    challenge.id,
    setTimeout(() => {
      mapping.delete(challenge.id);
      void refreshChallenge(challenge, client);
    }, 1000 * 120),
  );
}
