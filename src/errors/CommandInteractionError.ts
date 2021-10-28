import { CommandInteraction } from 'discord.js';
import CTFBotError from './index';

class CommandInteractionError extends CTFBotError {
  interaction: CommandInteraction;

  constructor(interaction: CommandInteraction, message: string) {
    super(message, 'CommandInteractionError');
    this.interaction = interaction;
  }
}

export const createCommandNotExecutedInGuildError = (interaction: CommandInteraction) =>
  new CommandInteractionError(interaction, 'this command must be executed in a guild');

export const createCommandNotFoundError = (interaction: CommandInteraction) =>
  new CommandInteractionError(interaction, 'this command does not have implemented functionality');

export const createCommandNotCachedError = (interaction: CommandInteraction) =>
  new CommandInteractionError(interaction, 'this command is not in the cache for some reason');
