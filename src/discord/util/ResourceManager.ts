import crypto from 'crypto';
import {
  CategoryChannel,
  Client,
  CommandInteraction,
  Guild,
  GuildBasedChannel,
  MessageComponentInteraction,
  MessageEditOptions,
  MessageEmbed,
  MessageOptions,
  ModalSubmitInteraction,
  PermissionResolvable,
  Permissions,
  Role,
  RoleResolvable,
  Snowflake,
  TextChannel,
  UserContextMenuInteraction,
  UserResolvable,
} from 'discord.js';
import { adminCommands, PopulatedCommandInteraction, participantCommands } from '../events/interaction/interaction';
import { ApplicationCommandPermissionTypes } from 'discord.js/typings/enums';
import { Ctf } from '../../database/models/Ctf';
import { TeamServer } from '../../database/models/TeamServer';
import { ChallengeChannel } from '../../database/models/ChallengeChannel';
import { Challenge } from '../../database/models/Challenge';
import { UnknownChallengeError } from '../../errors/UnknownChallengeError';
import { embedify, logger } from '../../log';
import { userContextMenuCommands } from '../events/interaction/userCommands';
import { discordConfig } from '../../config';

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
    deny: [
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.VIEW_CHANNEL,
      Permissions.FLAGS.ADD_REACTIONS,
      Permissions.FLAGS.CREATE_PUBLIC_THREADS,
      Permissions.FLAGS.CREATE_PRIVATE_THREADS,
    ],
  };

  // add readRole perms
  for (const role of options.readRoles) {
    permissionOverwrites[role] = permissionOverwrites[role] || {};
    permissionOverwrites[role].allow = [Permissions.FLAGS.VIEW_CHANNEL];
  }

  // add writeRole perms
  for (const role of options.writeRoles) {
    permissionOverwrites[role] = permissionOverwrites[role] || {};
    permissionOverwrites[role].allow = [
      // in case we already had allowed read roles
      ...(permissionOverwrites[role].allow || []),
      Permissions.FLAGS.SEND_MESSAGES,
      Permissions.FLAGS.ADD_REACTIONS,
      Permissions.FLAGS.CREATE_PUBLIC_THREADS,
      Permissions.FLAGS.CREATE_PRIVATE_THREADS,
    ];
  }

  const finalPermissionOverwrites = Object.entries(permissionOverwrites).map(([id, overwrite]) => ({
    ...overwrite,
    id,
  }));

  if (snowflake) {
    const textChannel = (await guild.channels.fetch(snowflake)) as TextChannel;
    if (textChannel) {
      if (textChannel.name !== name) await textChannel.setName(name);
      // overly simple check to avoid unnecessarily setting permissions
      if (textChannel.permissionOverwrites.cache.size !== finalPermissionOverwrites.length)
        await textChannel.permissionOverwrites.set(finalPermissionOverwrites);

      return textChannel;
    }
  }

  // create the channel if it doesn't exist
  return await guild.channels.create(name, {
    type: 'GUILD_TEXT',
    parent: options.parent,
    permissionOverwrites: finalPermissionOverwrites,
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
  adminRole: Role,
  userRole?: Role,
) {
  // only include user commands if we were given a user role
  const commandsToRegister = [...(userRole ? participantCommands : []), ...adminCommands, ...userContextMenuCommands];

  if (guild.commands.cache.size === 0) await guild.commands.fetch();

  // only if every command we want to register has already been registered
  const alreadyRegistered = commandsToRegister.every((com) =>
    guild.commands.cache.find((appCom) => appCom.applicationId === client.application.id && appCom.name === com.name),
  );

  const hasAdminRole = await guild.commands.cache.first()?.permissions.has({ permissionId: adminRole });
  const hasUserRole = userRole && (await guild.commands.cache.first()?.permissions.has({ permissionId: userRole }));

  // if command role permissions have gotten desync'd
  // or if there are unregistered commands, update
  if ((hasAdminRole || hasUserRole) && alreadyRegistered) return;

  logger.info('detected change, setting guild commands');
  await guild.commands.set(commandsToRegister);
  // ensure only admins can use admin commands and users can use user commands
  // TODO: we can't use the bulk command permissions anymore because Discord took it away with no notice :)))
  // await Promise.all(
  //   guild.commands.cache
  //     .filter((appCom) => appCom.applicationId === client.application.id && appCom.type === 'CHAT_INPUT')
  //     .map((com) =>
  //       com.permissions.set({
  //         permissions: [
  //           {
  //             id: participantCommands.find((ucom) => ucom.name === com.name) && userRole ? userRole.id : adminRole.id,
  //             type: ApplicationCommandPermissionTypes.ROLE,
  //             permission: true,
  //           },
  //         ],
  //       }),
  //     ),
  // );
}

/** This function takes in a channel and a series of messages, and does the following:
 * 1) posts the messages provided if the bot currently has no postings in this channel
 * 2) if the bot has already posted messages in this channel, REPLACE (via edit) those messages with the argument messages instead
 * 3) if the bot wants to post fewer messages than before, the extra messages are deleted
 */
export async function setChannelContent(
  client: Client<true>,
  channel: TextChannel,
  ...messages: (MessageEmbed | MessageEditOptions)[]
) {
  const existingMessages = await channel.messages.fetch();
  const botMessages = Array.from(existingMessages.filter((message) => message.author.id === client.user.id).values());

  for (const nextMessage of messages) {
    const nextMessageToPost = nextMessage instanceof MessageEmbed ? { embeds: [nextMessage] } : nextMessage;
    const nextMessageToEdit = botMessages.pop();
    // if the message already exists, we need to edit it
    if (nextMessageToEdit) {
      await nextMessageToEdit.edit(nextMessageToPost);
      continue;
    }
    // otherwise, we need to send it
    // TODO: this ts exception has to be here because the type signatures in the latest v13 are broken
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    await channel.send(nextMessageToPost);
  }

  // whatever messages are left in the array need to be deleted
  while (botMessages.length > 0) await botMessages.pop()?.delete();
}

export async function getCtfByGuildContext(guild: Guild) {
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

export async function sendErrorMessageForInteraction(
  interaction: MessageComponentInteraction | CommandInteraction | UserContextMenuInteraction | ModalSubmitInteraction,
  e: Error,
) {
  logger.error(e);
  const stack = discordConfig.hideStacktrace
    ? 'Contact a CTF Admin if you think this is a mistake.'
    : e.stack?.split('\n')[1];
  await interaction
    .editReply({
      embeds: [
        embedify({
          description: e.message ?? 'Unknown cause',
          title: e.name ?? 'Error',
          footer: stack,
        }),
      ],
    })
    .catch(() => logger.error('failed to respond with error code, the original channel was probably deleted'));
}

export async function ensureUsersHaveRolesOnGuild(users: Snowflake[], roles: Snowflake[], guild: Guild) {
  await guild.members.fetch({ user: users });
  const usersInGuild = users.filter((us) => guild.members.cache.has(us));
  await Promise.all(usersInGuild.map((u) => guild.members.cache.get(u)?.roles.set(roles)));
}
