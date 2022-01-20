import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { adminCommands, userCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

export async function refreshCTF(ctf: CTF, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create admin role
  const adminRole =
    (ctf.adminRoleSnowflake && (await guild.roles.fetch(ctf.adminRoleSnowflake))) ||
    (await guild.roles.create({ name: 'CTF Admin' }));
  ctf.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole =
    (ctf.participantRoleSnowflake && (await guild.roles.fetch(ctf.participantRoleSnowflake))) ||
    (await guild.roles.create({ name: 'Participant' }));
  ctf.participantRoleSnowflake = participantRole.id;

  // register CTF commands in this guild using the above roles
  const guildCommands =
    (await guild.commands.fetch()) || (await guild.commands.set(adminCommands.concat(userCommands)));

  // ensure only admins can use admin commands and participants can use user commands
  await guild.commands.permissions.set({
    fullPermissions: guildCommands.map((com) => ({
      id: com.id,
      permissions: [
        {
          id: userCommands.find((ucom) => ucom.name === com.name) ? participantRole.id : adminRole.id,
          type: ApplicationCommandPermissionTypes.ROLE,
          permission: true,
        },
      ],
    })),
  });

  // TODO: take into account startDate and endDate when setting command permissions

  // create info category
  const infoCategory =
    (ctf.infoCategorySnowflake && (await guild.channels.fetch(ctf.infoCategorySnowflake))) ||
    (await guild.channels.create('INFO', { type: 'GUILD_CATEGORY' }));
  ctf.infoCategorySnowflake = infoCategory.id;

  // create announcements channel
  const announcementsChannel =
    (ctf.announcementsChannelSnowflake && (await guild.channels.fetch(ctf.announcementsChannelSnowflake))) ||
    (await guild.channels.create('announcements', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.announcementsChannelSnowflake = announcementsChannel.id;

  // create TOS channel
  const tosChannel =
    (ctf.tosChannelSnowflake && (await guild.channels.fetch(ctf.tosChannelSnowflake))) ||
    (await guild.channels.create('terms-of-service', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.tosChannelSnowflake = tosChannel.id;

  // create scoreboard channel
  const scoreboardChannel =
    (ctf.scoreboardChannelSnowflake && (await guild.channels.fetch(ctf.scoreboardChannelSnowflake))) ||
    (await guild.channels.create('scoreboard', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.scoreboardChannelSnowflake = scoreboardChannel.id;
}

export async function destroyCTF(ctf: CTF, client: Client<true>) {
  const guild = await client.guilds.fetch(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // delete all the roles and channels
  const resources = await Promise.all([
    guild.roles.fetch(ctf.adminRoleSnowflake),
    guild.roles.fetch(ctf.participantRoleSnowflake),
    guild.channels.fetch(ctf.announcementsChannelSnowflake),
    guild.channels.fetch(ctf.tosChannelSnowflake),
    guild.channels.fetch(ctf.scoreboardChannelSnowflake),
    guild.channels.fetch(ctf.infoCategorySnowflake),
  ]);
  await Promise.all(resources.map((resource) => resource?.delete()));

  // oh yeah the commands too
  await guild.commands.set([]);
}
