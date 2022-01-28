import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import {
  createCategoryChannelOrFetchIfExists,
  createRoleOrFetchIfExists,
  createTextChannelOrFetchIfExists,
  destroyChannels,
  destroyRoles,
  registerGuildCommandsIfChanged,
} from '../util/ResourceManager';

export async function refreshCTF(ctf: CTF, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create admin role
  const adminRole = await createRoleOrFetchIfExists(guild, ctf.adminRoleSnowflake, 'CTF Admin');
  ctf.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole = await createRoleOrFetchIfExists(guild, ctf.participantRoleSnowflake, 'Participant');
  ctf.participantRoleSnowflake = participantRole.id;

  // register commands
  // TODO: take into account startDate and endDate when setting command permissions
  await registerGuildCommandsIfChanged(client, guild, participantRole, adminRole);

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
    },
  );
  ctf.announcementsChannelSnowflake = announcementsChannel.id;

  // create TOS channel
  const tosChannel = await createTextChannelOrFetchIfExists(guild, ctf.tosChannelSnowflake, 'terms-of-service', {
    parent: infoCategory,
  });
  ctf.tosChannelSnowflake = tosChannel.id;

  // create scoreboard channel
  const scoreboardChannel = await createTextChannelOrFetchIfExists(
    guild,
    ctf.scoreboardChannelSnowflake,
    'scoreboard',
    {
      parent: infoCategory,
    },
  );
  ctf.scoreboardChannelSnowflake = scoreboardChannel.id;
}

export async function destroyCTF(ctf: CTF, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // delete all the roles and channels
  await destroyRoles(guild, ctf.adminRoleSnowflake, ctf.participantRoleSnowflake);
  await destroyChannels(
    guild,
    ctf.infoCategorySnowflake,
    ctf.announcementsChannelSnowflake,
    ctf.tosChannelSnowflake,
    ctf.scoreboardChannelSnowflake,
  );

  // oh yeah the commands too
  await guild.commands.set([]);
}
