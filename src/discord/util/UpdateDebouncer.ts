import { Client } from 'discord.js';

// creates a debounced version of a refresh function
export function createDebouncer(
  action: (id: number, client: Client<true>) => void,
  delayMS: number,
): (id: number, client: Client<true>) => void {
  // mapping from id to updateTime
  const mapping = new Map<number, number>();

  return (id: number, client: Client<true>) => {
    const updateTime = mapping.get(id) || 0;
    const now = Date.now();

    // if updateTime is null OR more than delayMS in the past, update now and set to now
    if (now - updateTime > delayMS) {
      mapping.set(id, now);
      return action(id, client);
    }

    // if updateTime is not in the future but is less than two minutes in the past, set updateTime to the future and do setTimeout
    if (now > updateTime) {
      mapping.set(id, updateTime + delayMS);
      setTimeout(() => action(id, client), delayMS + updateTime - now);
      return;
    }

    // if updateTime is in the future, do nothing
  };
}
