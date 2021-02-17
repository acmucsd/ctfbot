import { Client } from 'discord.js';
import {
  category, challenge, ctf, ping, scoreboard, team,
} from './commands';
import CommandInteraction from './compat/CommandInteraction';
import log from '../../log';
import { setCommands } from './compat/commands';
import {
  ApplicationCommandDefinition, ApplicationCommandOption,
  ApplicationCommandResponse, ApplicationCommandResponseOption, CommandOptionMap,
  InteractionType,
} from './compat/types';

// our canonical list of application definitions
const commands: ApplicationCommandDefinition[] = [ping, ctf];

// utility to help us access passed options more intuitively
const mapToCommandOptionMap = (options: ApplicationCommandResponseOption[]): CommandOptionMap => options.reduce((obj, opt) => ({ ...obj, [opt.name]: opt.value }), {});

// recursive function to find the execute command that corresponds with this interaction
const executeCommand = (interaction: CommandInteraction, response: ApplicationCommandResponse, subcommands: ApplicationCommandDefinition[]): Promise<string> | string | void => {
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

  const response = await executeCommand(interaction, { name: interaction.commandName, options: interaction.options }, commands);
  if (response) {
    await interaction.reply({ content: response });
  }
};

export const registerCommands = async (client: Client) => {
  log('registering commands...');
  await setCommands(client, commands, '808487147853447216');
  log('commands registered');
};
