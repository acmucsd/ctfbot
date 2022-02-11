import { Category } from '../../database2/models/Category';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDatabaseNullError } from '../../errors/DatabaseNullError';

export async function refreshCategory(category: Category) {
  const ctf = await category.getCTF({ include: { model: TeamServer, attributes: ['id'] } });
  if (!ctf.teamServers) throw createDatabaseNullError('ctf.teamServers');

  const channels = await category.getCategoryChannels();

  for (const teamServer of ctf.teamServers) {
    if (channels.find((chan) => chan.teamServerId == teamServer.id)) continue;
    // there isn't a category channel for this teamserver + category combo
    // so we gotta create it
    await category.createCategoryChannel({ teamServerId: teamServer.id });
  }
}

// i shouldn't have to do anything when a category is destroyed because of the cascade policies
// ie when a category is deleted, the corresponding category channels will be destroyed as well

// export async function destroyCategory(category: Category) {
// }
