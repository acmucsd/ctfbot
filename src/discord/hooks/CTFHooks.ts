import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { createDiscordNullError } from '../../errors/DiscordNullError';
import { adminCommands, userCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

export async function refreshCTF(ctf: CTF, client: Client<true>) {
  const guild = client.guilds.resolve(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  // create admin role
  const adminRole = guild.roles.resolve(ctf.adminRoleSnowflake) || (await guild.roles.create({ name: 'CTF Admin' }));
  ctf.adminRoleSnowflake = adminRole.id;

  // create participant role
  const participantRole =
    guild.roles.resolve(ctf.participantRoleSnowflake) || (await guild.roles.create({ name: 'Participant' }));
  ctf.participantRoleSnowflake = participantRole.id;

  // register CTF commands in this guild using the above roles
  const guildCommands = await guild.commands.set(adminCommands.concat(userCommands));

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

  // create info category
  const infoCategory =
    guild.channels.resolve(ctf.infoCategorySnowflake) ||
    (await guild.channels.create('INFO', { type: 'GUILD_CATEGORY' }));
  ctf.infoCategorySnowflake = infoCategory.id;

  // create announcements channel
  const announcementsChannel =
    guild.channels.resolve(ctf.announcementsChannelSnowflake) ||
    (await guild.channels.create('announcements', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.announcementsChannelSnowflake = announcementsChannel.id;

  // create TOS channel
  const tosChannel =
    guild.channels.resolve(ctf.tosChannelSnowflake) ||
    (await guild.channels.create('terms-of-service', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.tosChannelSnowflake = tosChannel.id;

  // create scoreboard channel
  const scoreboardChannel =
    guild.channels.resolve(ctf.scoreboardChannelSnowflake) ||
    (await guild.channels.create('scoreboard', { type: 'GUILD_TEXT', parent: infoCategory.id }));
  ctf.scoreboardChannelSnowflake = scoreboardChannel.id;

  await ctf.save();
}

export async function destroyCTF(ctf: CTF, client: Client<true>) {
  const guild = client.guilds.resolve(ctf.guildSnowflake);
  if (!guild) throw createDiscordNullError('guildSnowflake');

  await guild.roles.resolve(ctf.adminRoleSnowflake)?.delete();
  await guild.roles.resolve(ctf.participantRoleSnowflake)?.delete();
  await guild.commands.set([]);
  await guild.channels.resolve(ctf.announcementsChannelSnowflake)?.delete();
  await guild.channels.resolve(ctf.tosChannelSnowflake)?.delete();
  await guild.channels.resolve(ctf.scoreboardChannelSnowflake)?.delete();
  await guild.channels.resolve(ctf.infoCategorySnowflake)?.delete();

  return;
}
