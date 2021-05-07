import { Client } from 'discord.js';
import { category, challenge, ctf, ping, scoreboard, team } from './commands';
import CommandInteraction from './compat/CommandInteraction';
import { logger, embedify } from '../../log';
import {
  ApplicationCommandDefinition,
  ApplicationCommandResponse,
  ApplicationCommandResponseOption,
  CommandOptionMap,
  InteractionType,
} from './compat/types';
import addctf from './commands/addctf';
import addserver from './commands/addserver';
import { setCommands } from './compat/commands';
import submit from './commands/submit';
import invite from './commands/invite';
import setcolor from './commands/setcolor';
import setname from './commands/setname';
import { CTF } from '../../database/models';

// our canonical list of application definitions
export const topLevelCommands: ApplicationCommandDefinition[] = [addctf, addserver];
export const adminCommands: ApplicationCommandDefinition[] = [ctf, team, category, challenge, scoreboard];
export const userCommands: ApplicationCommandDefinition[] = [ping, submit, invite, setname, setcolor];
const commands: ApplicationCommandDefinition[] = [...topLevelCommands, ...userCommands, ...adminCommands];

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
    await interaction.sendLoading();
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
  // first, register global commands
  await setCommands(client, topLevelCommands);
  logger(`registered global commands`);
  // register commands for all current guilds
  // TODO: we probably don't actually need this, lol
  // for (const guildID of client.guilds.cache.map((guild) => guild.id)) {
  //   try {
  //     const ctf = await CTF.fromGuildSnowflakeCTF(guildID);
  //     await ctf.registerCommands(client);
  //     logger(`registered commands for guild ${guildID}`);
  //   } catch (e) {
  //     logger(e);
  //     logger(`no ctf in guild ${guildID}`);
  //   }
  // }
  logger('commands registered');
};
