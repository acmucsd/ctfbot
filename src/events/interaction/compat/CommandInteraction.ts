import { Client } from 'discord.js';
import Interaction from './Interaction';
import { ApplicationCommandOption, CommandInteractionData, InteractionResponseType } from './types';

export default class CommandInteraction extends Interaction {
  commandID: string;

  commandName: string;

  options?: ApplicationCommandOption[];

  constructor(client: Client, data: CommandInteractionData) {
    super(client, data);

    /**
     * The ID of the invoked command.
     * @type {Snowflake}
     * @readonly
     */
    this.commandID = data.data.id;

    /**
     * The name of the invoked command.
     * @type {string}
     * @readonly
     */
    this.commandName = data.data.name;

    /**
     * The options passed to the command.
     * @type {Object}
     * @readonly
     */
    this.options = data.data.options;
  }
  /* eslint-disable */
  async reply(data) {
    // @ts-ignore
    await this.client.api.interactions(this.id, this.token).callback.post({
      data: {
        type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
        data
      },
    });
  }
}
