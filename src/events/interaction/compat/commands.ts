import { Client, Snowflake } from 'discord.js';
import ApplicationCommand from './ApplicationCommand';
import {
  ApplicationCommandRequest,
  InteractionResponseType,
  InteractionType,
} from './types';
import CommandInteraction from './CommandInteraction';

function transformCommand(command: ApplicationCommandRequest) {
  return {
    name: command.name,
    description: command.description,
    options: command.options?.map(function m(o) {
      return {
        type: o.type,
        name: o.name,
        description: o.description,
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
        listener(new CommandInteraction(client, interaction));
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

export async function setCommands(client: Client, commands: ApplicationCommandRequest[], guildID: Snowflake) {
  return await commands.map((command) => createCommand(client, command, guildID));
}

export async function createCommand(client: Client, command: ApplicationCommandRequest, guildID?: Snowflake) {
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
