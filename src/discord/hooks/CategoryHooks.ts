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
    if (channels.find((chan) => chan.teamServerId === teamServer.id)) continue;
    // there isn't a category channel for this teamserver + category combo
    // so we gotta create it
    await category.createCategoryChannel({ teamServerId: teamServer.id });
  }

  // now we want to trigger a refresh of our dependant categoryChannels as well
  await Promise.all(channels.map((chan) => refreshCategoryChannel(chan, client)));
}

// mainly we just need to destroy all category channels first
export async function destroyCategory(category: Category) {
  const channels = await category.getCategoryChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
