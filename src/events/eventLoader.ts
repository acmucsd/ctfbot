import { Client } from 'discord.js';
import readyEvent from './ready';
import messageEvent from './message';
import interactionEvent from './interaction';
import { registerInteractionEvent } from './interaction/compat/commands';

export default (client: Client) => {
  client.on('ready', () => readyEvent(client));
  client.on('message', (message) => void messageEvent(message));
  // comically long string of workarounds until discord.js mainlines their interaction support
  registerInteractionEvent(client, (interaction) => interactionEvent(interaction));
};
