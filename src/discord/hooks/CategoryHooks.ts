import { Category } from '../../database2/models/Category';
import { TeamServer } from '../../database2/models/TeamServer';
import { createDatabaseNullError } from '../../errors/DatabaseNullError';
import { refreshCategoryChannel } from './CategoryChannelHooks';
import { Client } from 'discord.js';
import { CategoryChannel } from '../../database2/models/CategoryChannel';

export async function refreshAllCategories(teamServer: TeamServer, client: Client<true>) {
  const ctf = await teamServer.getCTF({ include: Category });
  if (ctf.Categories) await Promise.all(ctf.Categories.map((cat) => refreshCategory(cat, client)));
}

export async function refreshCategory(category: Category, client: Client<true>) {
  const ctf = await category.getCTF({
    attributes: [],
    include: {
      model: TeamServer,
      attributes: ['id'],
      include: [
        {
          model: CategoryChannel,
          attributes: ['id'],
          include: [
            {
              model: Category,
              attributes: ['id'],
              required: true,
              where: { id: category.id },
            },
          ],
        },
      ],
    },
  });
  if (!ctf.TeamServers) throw createDatabaseNullError('ctf.teamServers');

  const channels = await category.getCategoryChannels();

  // filter out teamservers that already have a channel for this category
  const teamServersToAddTo = ctf.TeamServers.filter((ts) => !ts.CategoryChannels || ts.CategoryChannels.length === 0);

  // create new category channels for the team servers that need it
  for (const teamServer of teamServersToAddTo) {
    const categoryChannel = CategoryChannel.build();
    await categoryChannel.setTeamServer(teamServer, { save: false });
    await categoryChannel.setCategory(category, { save: false });
    await categoryChannel.save();
  }

  // now we want to trigger a refresh of our dependant categoryChannels as well
  await Promise.all(channels.map((chan) => refreshCategoryChannel(chan, client)));
}

// mainly we just need to destroy challenges and category channels first
export async function destroyCategory(category: Category) {
  const challenges = await category.getChallenges();
  await Promise.all(challenges.map((chal) => chal.destroy()));

  const channels = await category.getCategoryChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
