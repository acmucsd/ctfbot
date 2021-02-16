import { APIMessage } from 'discord.js';

export interface CommandOption extends Command {
  type: number,
  default: string,
  required: boolean,
  choices: string[]
}

export interface Command {
  name: string,
  description: string,
  options: CommandOption[]
}

export interface RegisteredCommand extends Command {
  id: string,
  application_id: string
}

export interface InteractionData {
  id: string,
  type: number,
  token: string,
  channel_id?: string,
  user?: string,
  guild_id?: string,
  member?: string
}

export interface CommandInteractionData extends InteractionData {
  data: {
    id: string,
    name: string,
    options: InteractionOptions
  }
}

export interface InteractionOptions {
  hideSource: boolean
}

export interface InteractionHandler {
  acknowledge: (options: InteractionOptions) => void,
  reply: (resolved: APIMessage) => boolean
}
