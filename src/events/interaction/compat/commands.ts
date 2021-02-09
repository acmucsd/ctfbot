import { Client, Snowflake } from 'discord.js';
import ApplicationCommand from './ApplicationCommand';
import { ApplicationCommandOptionType, InteractionResponseType, InteractionType } from './constants';
import { Command, InteractionHandler } from './types';
import CommandInteraction from './CommandInteraction';
import logger from '../../../log';

function transformCommand(command: Command) {
  return {
    name: command.name,
    description: command.description,
    options: command.options?.map(function m(o) {
      return {
        type: ApplicationCommandOptionType[o.type],
        name: o.name,
        description: o.description,
        default: o.default,
        required: o.required,
        choices: o.choices,
        options: o.options?.map(m),
      };
    }),
  };
}

/* eslint-disable */
export function registerInteractionEvent(client: Client, listener) {
  // @ts-ignore
  client.ws.on('INTERACTION_CREATE', (interaction) => {
    switch (interaction.type) {
      case InteractionType.PING:
        return {
          type: InteractionResponseType.PONG,
        };
      case InteractionType.APPLICATION_COMMAND: {
        logger('new command interaction', interaction)
        listener(new CommandInteraction(this.client, interaction.data));
      }
    }
  });
}

export async function fetchCommands(client: Client, guildID: Snowflake) {
  const clientID = (await client.fetchApplication()).id;
  // @ts-ignore
  let path = client.api.applications(clientID);
  if (guildID) {
    path = path.guilds(guildID);
  }
  const commands = await path.commands.get();
  return commands.map((c) => new ApplicationCommand(this, c, guildID));
}

export async function setCommands(client: Client, commands: Command[], guildID: Snowflake) {
  const clientID = (await client.fetchApplication()).id;
  let path = this.client.api.applications(clientID);
  if (guildID) {
    path = path.guilds(guildID);
  }
  const cs = await path.commands.post({
    data: commands.map(transformCommand),
  });
  return cs.map(c => new ApplicationCommand(this, c, guildID));
}

export async function createCommand(client: Client, command: Command, guildID?: Snowflake) {
  const clientID = (await client.fetchApplication()).id;
  // @ts-ignore
  let path = client.api.applications(clientID);
  if (guildID) {
    path = path.guilds(guildID);
  }
  const c = await path.commands.post({
    data: transformCommand(command),
  });
  return new ApplicationCommand(this, c, guildID);
}
