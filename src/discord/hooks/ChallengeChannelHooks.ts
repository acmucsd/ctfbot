import { CategoryChannel as DiscordCategoryChannel, Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { createTextChannelOrFetchIfExists, destroyChannels } from '../util/ResourceManager';
import { ChallengeChannel } from '../../database2/models/ChallengeChannel';
import { Category } from '../../database2/models/Category';
import { CategoryChannel } from '../../database2/models/CategoryChannel';
import { setChallengeMessage } from '../messages/ChallengeMessage';
import { TeamServer } from '../../database2/models/TeamServer';

export async function refreshChallengeChannel(challengeChannel: ChallengeChannel, client: Client<true>) {
  const teamServer = await challengeChannel.getTeamServer({ attributes: ['id', 'guildSnowflake'] });
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('teamServer.guildSnowflake');

  // get the category channel we should nest this channel under
  const challenge = await challengeChannel.getChallenge({
    include: {
      model: Category,
      attributes: ['id'],
      include: [
        {
          model: CategoryChannel,
          attributes: ['channelSnowflake'],
          include: [{ model: TeamServer, attributes: ['id'], where: { id: teamServer.id } }],
        },
      ],
    },
  });
  if (!challenge.Category || !challenge.Category.CategoryChannels || !challenge.Category.CategoryChannels[0])
    throw new Error("couldn't find the category channel this challenge channel belongs to");
  const categoryChannel = (await guild.channels.fetch(
    challenge.Category.CategoryChannels[0].channelSnowflake,
  )) as DiscordCategoryChannel;

  // create the actual channel for this challenge
  const channel = await createTextChannelOrFetchIfExists(guild, challengeChannel.channelSnowflake, challenge.name, {
    parent: categoryChannel,
  });
  challengeChannel.channelSnowflake = channel.id;

  // set the channel content
  await setChallengeMessage(client, channel, challenge);
}

export async function destroyChallengeChannel(challengeChannel: ChallengeChannel, client: Client<true>) {
  const teamServer = await challengeChannel.getTeamServer({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await destroyChannels(guild, challengeChannel.channelSnowflake);
}
