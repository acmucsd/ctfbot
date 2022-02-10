import {
  CategoryChannel,
  Client,
  Guild,
  MessageEmbed,
  OverwriteResolvable,
  PermissionResolvable,
  Permissions,
  Role,
  RoleResolvable,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { adminCommands, userCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

export async function createTextChannelOrFetchIfExists(
  guild: Guild,
  snowflake: string,
  name: string,
  options: { parent?: CategoryChannel; readRoles?: Snowflake[]; writeRoles?: Snowflake[] } = {},
): Promise<TextChannel> {
  const permissionOverwrites: { [key: Snowflake]: { deny?: PermissionResolvable[]; allow?: PermissionResolvable[] } } =
    {};

  // everyone can read by default, but only if not specified
  if (!options.readRoles) options.readRoles = [guild.roles.everyone.id];

  // nobody can write by default
  if (!options.writeRoles) options.writeRoles = [];

  // deny all permissions first
  permissionOverwrites[guild.roles.everyone.id] = {
    deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.ADD_REACTIONS],
  };

  // add readRole perms
  for (const role of options.readRoles) {
    permissionOverwrites[role] = permissionOverwrites[role] || {};
    permissionOverwrites[role].allow = [Permissions.FLAGS.VIEW_CHANNEL];
  }

  // add writeRole perms
  for (const role of options.writeRoles) {
    permissionOverwrites[role] = permissionOverwrites[role] || {};
    permissionOverwrites[role].allow = [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS];
  }

  // create the channel if it doesn't exist
  return (
    (snowflake && ((await guild.channels.fetch(snowflake)) as TextChannel)) ||
    (await guild.channels.create(name, {
      type: 'GUILD_TEXT',
      parent: options.parent,
      permissionOverwrites: Object.entries(permissionOverwrites).map(([id, overwrite]) => ({ ...overwrite, id })),
    }))
  );
}

export async function createCategoryChannelOrFetchIfExists(
  guild: Guild,
  snowflake: string,
  name: string,
): Promise<CategoryChannel> {
  return (
    (snowflake && ((await guild.channels.fetch(snowflake)) as CategoryChannel)) ||
    (await guild.channels.create(name, { type: 'GUILD_CATEGORY' }))
  );
}

export async function createRoleOrFetchIfExists(guild: Guild, snowflake: string, name: string): Promise<Role> {
  return (snowflake && (await guild.roles.fetch(snowflake))) || (await guild.roles.create({ name }));
}

export async function createInviteOrFetchIfExists(channel: TextChannel, code: string) {
  return (await channel.fetchInvites()).get(code) || (await channel.createInvite({ temporary: false, maxAge: 0 }));
}

export async function destroyRoles(guild: Guild, ...roleSnowflakes: string[]) {
  await Promise.all(roleSnowflakes.map((snowflake) => guild.roles.fetch(snowflake).then((role) => role?.delete())));
}

export async function destroyChannels(guild: Guild, ...channelSnowflakes: string[]) {
  await Promise.all(channelSnowflakes.map((snowflake) => guild.channels.fetch(snowflake))).then((channels) =>
    Promise.all(channels.map((channel) => channel?.delete())),
  );
}

export async function registerGuildCommandsIfChanged(
  client: Client<true>,
  guild: Guild,
  userRole: Role,
  adminRole: Role,
) {
  // only create new commands if they aren't already defined
  if (
    guild.commands.cache.filter((com) => com.applicationId === client.application.id).size !==
    userCommands.length + adminCommands.length
  ) {
    await guild.commands.fetch();
    await guild.commands.set(adminCommands.concat(userCommands));
    // ensure only admins can use admin commands and users can use user commands
    await guild.commands.permissions.set({
      fullPermissions: guild.commands.cache.map((com) => ({
        id: com.id,
        permissions: [
          {
            id: userCommands.find((ucom) => ucom.name === com.name) ? userRole.id : adminRole.id,
            type: ApplicationCommandPermissionTypes.ROLE,
            permission: true,
          },
        ],
      })),
    });
  }
}

/** This function takes in a channel and a series of messages, and does the following:
 * 1) posts the messages provided if the bot currently has no postings in this channel
 * 2) if the bot has already posted messages in this channel, REPLACE (via edit) those messages with the argument messages instead
 * 3) if the bot wants to post fewer messages than before, the extra messages are deleted
 */
export async function setChannelContent(client: Client<true>, channel: TextChannel, ...messages: MessageEmbed[]) {
  const existingMessages = await channel.messages.fetch();
  const botMessages = Array.from(existingMessages.filter((message) => message.author.id === client.user.id).values());

  for (const nextMessageToPost of messages) {
    const nextMessageToEdit = botMessages.pop();
    // if the message already exists, we need to edit it
    if (nextMessageToEdit) {
      await nextMessageToEdit.edit({ embeds: [nextMessageToPost] });
      continue;
    }
    // otherwise, we need to send it
    await channel.send({ embeds: [nextMessageToPost] });
  }

  // whatever messages are left in the array need to be deleted
  while (botMessages.length > 0) await botMessages.pop()?.delete();
}
