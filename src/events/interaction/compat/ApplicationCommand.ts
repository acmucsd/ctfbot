import { Client, Snowflake } from 'discord.js';
import { ApplicationCommandOption, RegisteredCommand } from './types';

export default class ApplicationCommand {
  client: Client;

  guildID: Snowflake | null;

  id: Snowflake;

  applicationID: Snowflake;

  name: string;

  description: string;

  options: ApplicationCommandOption[];

  constructor(client: Client, data: RegisteredCommand, guildID: Snowflake) {
    /**
     * The client that instantiated this
     * @type {Client}
     * @readonly
     */
    this.client = client;

    /**
     * The ID of the guild this command is part of, if any.
     * @type {Snowflake?}
     * @readonly
     */
    this.guildID = guildID || null;

    /**
     * The ID of this command.
     * @type {Snowflake}
     * @readonly
     */
    this.id = data.id;

    /**
     * The ID of the application which owns this command.
     * @type {Snowflake}
     * @readonly
     */
    this.applicationID = data.application_id;

    /**
     * The name of this command.
     * @type {string}
     * @readonly
     */
    this.name = data.name;

    /**
     * The description of this command.
     * @type {string}
     * @readonly
     */
    this.description = data.description;

    /**
     * The options of this command.
     * @type {Object[]}
     * @readonly
     */
    this.options = data.options?.map(function m(o): ApplicationCommandOption {
      return {
        type: o.type,
        name: o.name,
        description: o.description,
        required: o.required,
        choices: o.choices,
        options: o.options?.map(m),
      };
    });
  }

  /* eslint-disable */
  async delete() {
    // @ts-ignore
    let path = this.client.api.applications('@me');
    if (this.guildID) {
      path = path.guilds(this.guildID);
    }
    await path.commands(this.id).delete();
  }
}
