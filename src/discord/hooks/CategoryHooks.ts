import { Category } from '../../database2/models/Category';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDatabaseNullError } from '../../errors/DatabaseNullError';
import { refreshCategoryChannel } from './CategoryChannelHooks';
import { Client } from 'discord.js';

export async function refreshCategory(category: Category, client: Client<true>) {
  const ctf = await category.getCTF({ include: { model: TeamServer, attributes: ['id'] } });
  if (!ctf.TeamServers) throw createDatabaseNullError('ctf.teamServers');

  const channels = await category.getCategoryChannels();

  for (const teamServer of ctf.TeamServers) {
    if (await teamServer.hasCategory(category)) continue;
    // there isn't a category channel for this teamserver + category combo
    // so we gotta create it
    await teamServer.addCategory(category);
  }

  // now we want to trigger a refresh of our dependant categoryChannels as well
  await Promise.all(channels.map((chan) => refreshCategoryChannel(chan, client)));
}

// i shouldn't have to do anything when a category is destroyed because of the cascade policies
// ie when a category is deleted, the corresponding category channels will be destroyed as well

// export async function destroyCategory(category: Category) {
// }
