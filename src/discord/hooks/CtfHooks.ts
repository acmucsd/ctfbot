import { Ctf } from '../../database/models/Ctf';
import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import {
  createCategoryChannelOrFetchIfExists,
  createRoleOrFetchIfExists,
  createTextChannelOrFetchIfExists,
  destroyChannels,
  destroyRegisteredGuildCommands,
  destroyRoles,
  registerGuildCommandsIfChanged,
} from '../util/ResourceManager';
import { setTosMessage } from '../messages/TosMessage';

export async function refreshCtf(ctf: Ctf, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create admin role
  const adminRole = await createRoleOrFetchIfExists(guild, ctf.adminRoleSnowflake, 'CTF Admin');
  ctf.adminRoleSnowflake = adminRole.id;

  // register commands
  // TODO: take into account startDate and endDate when setting command permissions
  await registerGuildCommandsIfChanged(client, guild, adminRole);

  // create info category
  const infoCategory = await createCategoryChannelOrFetchIfExists(guild, ctf.infoCategorySnowflake, 'INFO');
  ctf.infoCategorySnowflake = infoCategory.id;

  // create announcements channel
  const announcementsChannel = await createTextChannelOrFetchIfExists(
    guild,
    ctf.announcementsChannelSnowflake,
    'announcements',
    {
      parent: infoCategory,
      preservePermissions: true,
    },
  );
  ctf.announcementsChannelSnowflake = announcementsChannel.id;

  // create TOS channel
  const tosChannel = await createTextChannelOrFetchIfExists(guild, ctf.tosChannelSnowflake, 'terms-of-service', {
    parent: infoCategory,
    preservePermissions: true,
  });
  ctf.tosChannelSnowflake = tosChannel.id;

  // set TOS message WARNING: this is an unsafe operation
  await setTosMessage(client, tosChannel, ctf);
}

export async function destroyCtf(ctf: Ctf, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // destroy all associated categories as a side effect
  const categories = await ctf.getCategories();
  await Promise.all(categories.map((cat) => cat.destroy()));

  // destroy all associated team servers as a side effect
  const teamServers = await ctf.getTeamServers();
  await Promise.all(teamServers.map((ts) => ts.destroy()));

  // destroy all associated scoreboards as a side effect
  const scoreboards = await ctf.getScoreboards();
  await Promise.all(scoreboards.map((sb) => sb.destroy()));

  // delete all the roles and channels
  await destroyRoles(guild, ctf.adminRoleSnowflake);
  await destroyChannels(guild, ctf.infoCategorySnowflake, ctf.announcementsChannelSnowflake, ctf.tosChannelSnowflake);

  await destroyRegisteredGuildCommands(guild);
}
