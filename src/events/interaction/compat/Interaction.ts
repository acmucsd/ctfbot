import {
  Channel, Client, Guild, GuildMember, Snowflake, User,
} from 'discord.js';
import { InteractionType } from './constants';
import { InteractionData } from './types';

export default class Interaction {
  client: Client;

  type: number;

  id: Snowflake;

  token: string;

  channel?: Channel;

  user?: User;

  guild?: Guild;

  member?: GuildMember;

  constructor(client: Client, data: InteractionData) {
    /**
     * The client that instantiated this
     * @type {Client}
     * @readonly
     */
    this.client = client;

    /**
     * Type of this interaction.
     * @type {string}
     * @readonly
     */
    this.type = InteractionType[data.type];

    /**
     * ID of this interaction.
     * @type {Snowflake}
     * @readonly
     */
    this.id = data.id;

    /**
     * The token of this interaction.
     * @type {string}
     * @readonly
     */
    this.token = data.token;

    /**
     * The channel this interaction was sent in.
     * @type {?Channel}
     * @readonly
     */
    this.channel = this.client.channels?.cache.get(data.channel_id) || null;

    /**
     * If this interaction was sent in a DM, the user which sent it.
     * @type {?User}
     * @readonly
     */
    this.user = this.client.users?.add(data.user, false) ?? null;

    /**
     * The guild this interaction was sent in, if any.
     * @type {?Guild}
     * @readonly
     */
    this.guild = this.client.guilds?.cache.get(data.guild_id) ?? null;

    /**
     * If this interaction was sent in a guild, the member which sent it.
     * @type {?GuildMember}
     * @readonly
     */
    this.member = this.guild?.members.add(data.member, false) ?? null;
  }
}
