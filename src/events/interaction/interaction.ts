import { Client, MessageEmbed } from 'discord.js';
import { category, challenge, ctf, ping, scoreboard, team } from './commands';
import CommandInteraction from './compat/CommandInteraction';
import { logger, embedify } from '../../log';
import { setCommands } from './compat/commands';
import {
  ApplicationCommandDefinition,
  ApplicationCommandOption,
  ApplicationCommandResponse,
  ApplicationCommandResponseOption,
  CommandOptionMap,
  InteractionType,
} from './compat/types';

// our canonical list of application definitions
const commands: ApplicationCommandDefinition[] = [ping, ctf, team, category, challenge];

// utility to help us access passed options more intuitively
const mapToCommandOptionMap = (options: ApplicationCommandResponseOption[]): CommandOptionMap =>
  options?.reduce((obj, opt) => ({ ...obj, [opt.name]: opt.value }), {}) ?? {};

// recursive function to find the execute command that corresponds with this interaction
const executeCommand = (
  interaction: CommandInteraction,
  response: ApplicationCommandResponse,
  subcommands: ApplicationCommandDefinition[],
): Promise<string> | Promise<void> | string | void => {
  const command = subcommands.find((com) => com.name === response.name);
  if (!command) return 'Command not recognized';
  // if this command definition contains a function, we should just execute it with the options we have
  if (command.execute) {
    return command.execute(interaction, mapToCommandOptionMap(response.options));
  }
  // if function not found yet, traverse further down the tree
  return executeCommand(interaction, response.options[0], command.options);
};

// handler for interaction events
export const interactionEvent = async (interaction: CommandInteraction) => {
  if (interaction.type !== InteractionType.APPLICATION_COMMAND) return;

  try {
    const response = await executeCommand(
      interaction,
      { name: interaction.commandName, options: interaction.options },
      commands,
    );
    if (response) {
      logger(response);
      await interaction.reply({
        embeds: [
          embedify({
            description: response,
            title: 'Command',
            color: '50c0bf',
          }),
        ],
      });
    }
  } catch (_e) {
    logger(_e);
    // pretty print errors B)
    const e = _e as Error;
    await interaction.reply({
      embeds: [
        embedify({
          description: e.message ?? 'Unknown cause',
          title: e.name ?? 'Error',
          footer: e.stack.split('\n')[1],
        }),
      ],
    });
  }
};

export const registerCommands = async (client: Client) => {
  logger('registering commands...');
  for (const guildID of client.guilds.cache.map((guild) => guild.id)) {
    await setCommands(client, commands, guildID);
  }
  logger('commands registered');
};
