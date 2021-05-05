import { Client } from 'discord.js';
import {
  readyEvent,
  guildMemberAddEvent,
  guildMemberRemoveEvent,
  interactionEvent,
  MessageEvent,
  messageReactionAddEvent,
  rateLimitEvent,
} from './';
import { registerInteractionEvent } from './interaction/compat/commands';

export default (client: Client) => {
  client.on('ready', () => readyEvent(client));
  client.on('message', (message) => void MessageEvent(message));
  client.on('guildMemberAdd', (member) => void guildMemberAddEvent(member));
  client.on('guildMemberRemove', (member) => void guildMemberRemoveEvent(member));
  client.on('messageReactionAdd', (reaction, user) => void messageReactionAddEvent(reaction, user));
  client.on('rateLimit', (rateLimitInfo) =>
    rateLimitEvent(rateLimitInfo.timeout, rateLimitInfo.limit, rateLimitInfo.method, rateLimitInfo.path),
  );
  // comically long string of workarounds until discord.js mainlines their interaction support
  registerInteractionEvent(client, (interaction) => interactionEvent(interaction));
};
