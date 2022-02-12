import { Client } from 'discord.js';
import { CategoryChannel } from '../../database2/models/CategoryChannel';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { createCategoryChannelOrFetchIfExists, destroyChannels } from '../util/ResourceManager';

export async function refreshCategoryChannel(categoryChannel: CategoryChannel, client: Client<true>) {
  const teamServer = await categoryChannel.getTeamServer({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('teamServer.guildSnowflake');

  // create the actual channel for this category
  const category = await categoryChannel.getCategory({ attributes: ['name'] });
  const channel = await createCategoryChannelOrFetchIfExists(guild, categoryChannel.channelSnowflake, category.name);
  categoryChannel.channelSnowflake = channel.id;
}

export async function destroyCategoryChannel(categoryChannel: CategoryChannel, client: Client<true>) {
  const teamServer = await categoryChannel.getTeamServer({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(teamServer.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await destroyChannels(guild, categoryChannel.channelSnowflake);
}

// TODO: remove many-to-many between TS and categories since its not useful, keep one-to-one
