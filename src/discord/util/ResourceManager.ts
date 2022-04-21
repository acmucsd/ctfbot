import crypto from 'crypto';
import {
  CategoryChannel,
  Client,
  Guild,
  GuildBasedChannel,
  MessageEmbed,
  PermissionResolvable,
  Permissions,
  Role,
  Snowflake,
  TextChannel,
} from 'discord.js';
import { adminCommands, PopulatedCommandInteraction, userCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { Ctf } from '../../database/models/Ctf';
import { TeamServer } from '../../database/models/TeamServer';
import { ChallengeChannel } from '../../database/models/ChallengeChannel';
import { Challenge } from '../../database/models/Challenge';
import { UnknownChallengeError } from '../../errors/UnknownChallengeError';
import { logger } from '../../log';

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
  if (snowflake) {
    const textChannel = (await guild.channels.fetch(snowflake)) as TextChannel;
    if (textChannel) {
      if (textChannel.name !== name) await textChannel.setName(name);

      return textChannel;
    }
  }

  return await guild.channels.create(name, {
    type: 'GUILD_TEXT',
    parent: options.parent,
    permissionOverwrites: Object.entries(permissionOverwrites).map(([id, overwrite]) => ({ ...overwrite, id })),
  });
}

export async function createCategoryChannelOrFetchIfExists(
  guild: Guild,
  snowflake: string,
  name: string,
): Promise<CategoryChannel> {
  if (snowflake) {
    const categoryChannel = (await guild.channels.fetch(snowflake)) as CategoryChannel;
    if (categoryChannel) {
      // set the name of the existing channel if it doesn't match
      if (categoryChannel.name !== name) await categoryChannel.setName(name);

      return categoryChannel;
    }
  }

  return await guild.channels.create(name, { type: 'GUILD_CATEGORY' });
}

export async function createRoleOrFetchIfExists(guild: Guild, snowflake: string, name: string): Promise<Role> {
  return (snowflake && (await guild.roles.fetch(snowflake))) || (await guild.roles.create({ name }));
}

export async function createInviteOrFetchIfExists(channel: TextChannel, code: string) {
  return (await channel.fetchInvites()).get(code) || (await channel.createInvite({ temporary: false, maxAge: 0 }));
}

export async function destroyRoles(guild: Guild, ...roleSnowflakes: string[]) {
  await Promise.all(
    roleSnowflakes
      .filter((snowflake) => snowflake)
      .map((snowflake) => guild.roles.fetch(snowflake).then((role) => role?.delete())),
  );
}

export async function destroyChannels(guild: Guild, ...channelSnowflakes: string[]) {
  const channels = await Promise.all(
    channelSnowflakes
      .filter((snowflake) => snowflake)
      .map((snowflake) =>
        guild.channels.fetch(snowflake).catch(() => {
          /** for some reason, this can throw an error if the channel isn't found */
        }),
      ),
  );
  await Promise.all(channels.map((chan) => chan?.delete()));
}

export async function destroyRegisteredGuildCommands(guild: Guild) {
  await guild.commands.set([]);
  // this doesn't clear the cache for some reason so we do that manually
  guild.commands.cache.clear();
}

export async function registerGuildCommandsIfChanged(
  client: Client<true>,
  guild: Guild,
  userRole: Role,
  adminRole: Role,
) {
  // hash of currently registered commands in this guild
  if (guild.commands.cache.size === 0) await guild.commands.fetch();
  const registeredCommandsHash = crypto.createHash('sha256');
  guild.commands.cache
    .filter((com) => com.applicationId === client.application.id)
    .map(
      (com) =>
        `${com.name} ${com.options
          .map((opt) => opt.name)
          .sort()
          .join('')}`,
    )
    .sort()
    .forEach((comName) => registeredCommandsHash.update(comName));

  // hash of internal commands that we want registered in this guild
  const internalCommandsHash = crypto.createHash('sha256');
  [...userCommands, ...adminCommands]
    .map(
      (com) =>
        `${com.name} ${
          com.options
            ?.map((opt) => opt.name)
            .sort()
            .join('') ?? ''
        }`,
    )
    .sort()
    .forEach((comName) => internalCommandsHash.update(comName));

  // only overwrite existing commands if they don't match
  if (registeredCommandsHash.digest('hex') !== internalCommandsHash.digest('hex')) {
    logger.info('detected change, setting guild commands');
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

export async function getCTFByGuildContext(guild: Guild) {
  const ctf = await Ctf.findOne({ where: { guildSnowflake: guild.id } });
  if (ctf) return ctf;

  // otherwise, see if this is a team server guild and return the original ctf
  const teamServer = await TeamServer.findOne({
    where: { guildSnowflake: guild.id },
    include: { model: Ctf, required: true },
  });

  return teamServer?.Ctf;
}

export async function getChallengeByInteraction(interaction: PopulatedCommandInteraction) {
  return await getChallengeByChannelContext(interaction.options.getChannel('challenge_channel') || interaction.channel);
}

export async function getChallengeByChannelContext(channel: GuildBasedChannel | null) {
  if (!channel) throw new UnknownChallengeError();
  const challengeChannel = await ChallengeChannel.findOne({
    attributes: [],
    where: { channelSnowflake: channel.id },
    include: Challenge,
  });
  if (!challengeChannel || !challengeChannel.Challenge) throw new UnknownChallengeError();
  return challengeChannel.Challenge;
}
