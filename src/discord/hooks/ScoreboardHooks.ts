import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { createTextChannelOrFetchIfExists, destroyChannels } from '../util/ResourceManager';
import { Scoreboard } from '../../database/models/Scoreboard';
import { setScoreboardMessage } from '../messages/ScoreboardMessage';
import { createDebouncer } from '../util/UpdateDebouncer';

export async function refreshScoreboard(scoreboard: Scoreboard, client: Client<true>) {
  const ctf = await scoreboard.getCtf({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create the actual channel for this Scoreboard
  const channel = await createTextChannelOrFetchIfExists(guild, scoreboard.channelSnowflake, scoreboard.name, {
    preservePermissions: true,
  });
  scoreboard.channelSnowflake = channel.id;

  // set channel content
  await setScoreboardMessage(client, scoreboard);
}

export const debouncedRefreshScoreboard = createDebouncer((id, client) => {
  Scoreboard.findByPk(id)
    .then((sb) => sb && void refreshScoreboard(sb, client))
    .catch(() => {
      /* don't care */
    });
}, 1000 * 120);

export async function destroyScoreboard(scoreboard: Scoreboard, client: Client<true>) {
  const ctf = await scoreboard.getCtf({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await destroyChannels(guild, scoreboard.channelSnowflake);
}
