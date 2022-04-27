import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { createTextChannelOrFetchIfExists, destroyChannels } from '../util/ResourceManager';
import { Scoreboard } from '../../database/models/Scoreboard';
import { setScoreboardMessage } from '../messages/ScoreboardMessage';

export async function refreshScoreboard(scoreboard: Scoreboard, client: Client<true>) {
  const ctf = await scoreboard.getCtf({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create the actual channel for this Scoreboard
  const channel = await createTextChannelOrFetchIfExists(guild, scoreboard.channelSnowflake, scoreboard.name);
  scoreboard.channelSnowflake = channel.id;

  // set channel content
  await setScoreboardMessage(client, scoreboard);
}

export async function destroyScoreboard(scoreboard: Scoreboard, client: Client<true>) {
  const ctf = await scoreboard.getCtf({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await destroyChannels(guild, scoreboard.channelSnowflake);
}
