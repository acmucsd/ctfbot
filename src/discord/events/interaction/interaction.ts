import {
  ApplicationCommandSubCommandData,
  ApplicationCommandSubGroupData,
  ChatInputApplicationCommandData,
  Client,
  CommandInteraction,
  Interaction,
} from 'discord.js';
import { category, challenge, ctf } from './commands';
import { embedify, logger } from '../../../log';
import addctf from './commands/addctf';
import addserver from './commands/addserver';
import submit from './commands/submit';
import setname from './commands/setname';
import standing from './commands/standing';
import { createCommandNotFoundError } from '../../../errors/CommandInteractionError';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { handleButtonInteraction } from './buttons';
import { sendErrorMessageForInteraction } from '../../util/ResourceManager';
import { handleUserInteraction, userContextMenuCommands } from './userCommands';
import { handleModelSubmitInteraction } from './modelSubmit';
import scoreboard from './commands/scoreboard';
import invite from './commands/invite';

// our canonical list of application definitions
export const topLevelCommands: ChatInputCommandDefinition[] = [addctf, addserver, invite];
export const adminCommands: ChatInputCommandDefinition[] = [ctf, category, challenge, scoreboard];
export const participantCommands: ChatInputCommandDefinition[] = [submit, setname, standing];
const chatCommands: ChatInputCommandDefinition[] = [...topLevelCommands, ...participantCommands, ...adminCommands];

const getHandlerForInteraction = (interaction: CommandInteraction): CommandHandler => {
  const definition = chatCommands.find((def) => def.name === interaction.commandName);
  if (!definition || !definition) throw createCommandNotFoundError(interaction);

  // handle the case where its a root-level command
  if ('execute' in definition) return definition.execute;

  const subcommandGroupName = interaction.options.getSubcommandGroup(false);
  const subcommandName = interaction.options.getSubcommand(false);

  // handle the case where its command -> subcommand
  if (!subcommandGroupName) {
    const commandDefinition = definition.options
      .filter((opt): opt is ExecutableSubCommandData => opt.type === ApplicationCommandOptionTypes.SUB_COMMAND)
      .find((opt) => opt.name === subcommandName);
    if (!commandDefinition) throw createCommandNotFoundError(interaction);
    return commandDefinition.execute;
  }

  // handle the case where its command -> subcommand group -> subcommand
  const groupDefinition = definition.options
    .filter((opt): opt is ExecutableSubGroupData => opt.type === ApplicationCommandOptionTypes.SUB_COMMAND_GROUP)
    .find((opt) => opt.name === subcommandGroupName);
  if (!groupDefinition) throw createCommandNotFoundError(interaction);
  const commandDefinition = groupDefinition.options.find((opt) => opt.name === subcommandName);
  if (!commandDefinition) throw createCommandNotFoundError(interaction);
  return commandDefinition.execute;
};

const handleCommandInteraction = async (interaction: CommandInteraction<'cached'>) => {
  try {
    // send that we're loading the response to this, but we aren't ready to send it.
    await interaction.deferReply({ ephemeral: true });

    // if the guild isn't fully populated, we can do so now
    if (!interaction.guild.name) await interaction.guild.fetch();

    const handler = getHandlerForInteraction(interaction);
    const response = await handler(interaction);

    logger.info(response);

    await interaction.editReply({
      embeds: [
        embedify({
          description: response,
          title: 'Command',
          color: '#50c0bf',
        }),
      ],
    });
  } catch (e: unknown) {
    await sendErrorMessageForInteraction(interaction, e);
  }
};

// handler for interaction events
export const interactionEvent = async (interaction: Interaction) => {
  if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
    return;
  }

  // for now, we're not interested in other interactions that do not occur in a cached guild
  if (!interaction.inCachedGuild()) return;

  if (interaction.isModalSubmit()) {
    await handleModelSubmitInteraction(interaction);
  } else if (interaction.isCommand()) {
    await handleCommandInteraction(interaction);
  } else if (interaction.isUserContextMenu()) {
    await handleUserInteraction(interaction);
  }
};

export const registerCommands = async (client: Client<true>) => {
  logger.info('registering commands....');
  // first, register global commands
  await client.application.commands.set([...topLevelCommands, ...userContextMenuCommands]);

  logger.info(`registered global commands`);
};

// types for adding execution information to the existing ChatInputApplicationCommand types

type CommandHandler = (interaction: PopulatedCommandInteraction) => Promise<string> | string;
type ExecutableCommandData = { execute: CommandHandler };

export type ExecutableTopLevelCommandData = ChatInputApplicationCommandData & ExecutableCommandData;
export type ExecutableSubCommandData = ApplicationCommandSubCommandData & ExecutableCommandData;
export type ExecutableSubGroupData = Omit<ApplicationCommandSubGroupData, 'options'> & {
  options: ExecutableSubCommandData[];
};

type CommandWithExecutableSubCommands = Omit<ChatInputApplicationCommandData, 'options'> & {
  options: (ExecutableSubGroupData | ExecutableSubCommandData)[];
};

export type ChatInputCommandDefinition = ExecutableTopLevelCommandData | CommandWithExecutableSubCommands;
export type PopulatedCommandInteraction = CommandInteraction<'cached'>;
