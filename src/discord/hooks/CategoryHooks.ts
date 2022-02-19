import { Category } from '../../database/models/Category';
import { TeamServer } from '../../database/models/TeamServer';
import { refreshCategoryChannel } from './CategoryChannelHooks';
import { Client } from 'discord.js';
import { CategoryChannel } from '../../database/models/CategoryChannel';

export async function refreshAllCategories(teamServer: TeamServer, client: Client<true>) {
  const ctf = await teamServer.getCTF({ include: Category });
  if (ctf.Categories) await Promise.all(ctf.Categories.map((cat) => refreshCategory(cat, client)));
}

export async function refreshCategory(category: Category, client: Client<true>) {
  const ctf = await category.getCTF({
    attributes: [],
    where: { '$TeamServers.CategoryChannels.id$': null },
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
              where: { id: category.id },
              attributes: ['id'],
            },
          ],
        },
      ],
    },
  });

  if (ctf?.TeamServers) {
    // create new category channels for the team servers that need it
    for (const teamServer of ctf.TeamServers) {
      const categoryChannel = CategoryChannel.build();
      await categoryChannel.setTeamServer(teamServer, { save: false });
      await categoryChannel.setCategory(category, { save: false });
      await categoryChannel.save();
    }
  }

  // now we want to trigger a refresh of our dependant categoryChannels as well
  const channels = await category.getCategoryChannels();
  await Promise.all(channels.map((chan) => refreshCategoryChannel(chan, client).then(() => chan.save())));
}

// mainly we just need to destroy challenges and category channels first
export async function destroyCategory(category: Category) {
  const challenges = await category.getChallenges();
  await Promise.all(challenges.map((chal) => chal.destroy()));

  const channels = await category.getCategoryChannels();
  await Promise.all(channels.map((chan) => chan.destroy()));
}
