import { CategoryChannel, Client, Guild, MessageEmbed, Permissions, Role, TextChannel } from 'discord.js';
import { adminCommands, userCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';

export async function createTextChannel(
  guild: Guild,
  snowflake: string,
  name: string,
  options: { parent?: CategoryChannel } = {},
): Promise<TextChannel> {
  const permissionOverwrites = [];

  // deny write permissions by default
  permissionOverwrites.push({
    id: guild.roles.everyone.id,
    deny: [Permissions.FLAGS.SEND_MESSAGES, Permissions.FLAGS.ADD_REACTIONS],
  });

  return (
    (snowflake && ((await guild.channels.fetch(snowflake)) as TextChannel)) ||
    (await guild.channels.create(name, { type: 'GUILD_TEXT', parent: options.parent }))
  );
}

export async function createCategoryChannel(guild: Guild, snowflake: string, name: string): Promise<CategoryChannel> {
  return (
    (snowflake && ((await guild.channels.fetch(snowflake)) as CategoryChannel)) ||
    (await guild.channels.create(name, { type: 'GUILD_CATEGORY' }))
  );
}

export async function createRole(guild: Guild, snowflake: string, name: string): Promise<Role> {
  return (snowflake && (await guild.roles.fetch(snowflake))) || (await guild.roles.create({ name }));
}

export async function createInvite(channel: TextChannel, code: string) {
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

export async function registerGuildCommands(client: Client<true>, guild: Guild, userRole: Role, adminRole: Role) {
  // only create new commands if they aren't already defined
  await guild.commands.fetch();
  if (guild.commands.cache.filter((com) => com.applicationId === client.application.id).size === 0) {
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
