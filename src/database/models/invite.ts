import query from '../database';
import { InviteRow } from '../schemas';
import User from './user';
import Team from './team';
import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { createDiscordNullError } from "../../errors/DiscordNullError";

export default class Invite {
  row: InviteRow;

  constructor(row: InviteRow) {
    this.row = row;
  }

  // send invite message
  async sendInviteMessage(client: Client, toUser: User, fromTeam: Team) {
    const currentTeam = await toUser.getTeam();
    if(!currentTeam.row.text_channel_snowflake)
      throw createDiscordNullError('text_channel_snowflake');
    const currentTeamChannel = (await client.channels.fetch(currentTeam.row.text_channel_snowflake)) as TextChannel;

    const message = new MessageEmbed();
    message.color = 15158332;
    message.title = `You have been invited to join **Team ${fromTeam.row.name}**`;
    message.description = `You (<@${toUser.row.user_snowflake}>) can accept this invite if you ***react to this message*** with :+1:.`;
    message.description += '\n\nYour team chat will be deleted and you will be added to their team chats.';
    message.description += '\n\n**You may also need to join their team server if they are in a different region.**';
    message.description += '\nIf so, look for your new team server chat in the Main Guild.';
    message.addField(
      '⚠️  WARNING  ⚠️',
      'If you join a team, you will not be able to leave it or join another. ***Make sure this is the team you would like to join.***',
    );

    const sentMessage = await currentTeamChannel.send({ embeds: [message] });
    await this.setMessageSnowflake(sentMessage.id);

    // lets ALSO DM them IF they aren't on their team server
    const discordUser = client.users.resolve(toUser.row.user_snowflake);
    if (discordUser && !currentTeamChannel.guild.members.resolve(discordUser)) {
      const invite = await currentTeamChannel.createInvite();
      await discordUser
        .send(`You have been invited to join a team. Join your team channel to accept the invite. ${invite.url}`)
        .catch(() => { console.log(`couldn't dm invite user...probably has DM's disabled`) } /* I don't care if it works! */);
    }

    // add a react listener to actually add the person to the team
    await sentMessage.react('👍');
  }

  static async allPendingInvites() {
    const { rows: inviteRows } = await query(`SELECT * from invites WHERE accepted = FALSE`);
    return inviteRows.map((row) => new Invite(row as InviteRow));
  }

  /** Invite Creation / Removal */
  // makeInvite made in Team

  async deleteInvite() {
    await query(`DELETE FROM invites WHERE id = ${this.row.id}`);
  }

  async setMessageSnowflake(messageSnowflake: string) {
    await query(`UPDATE invites SET message_snowflake = $1 WHERE id = ${this.row.id}`, [messageSnowflake]);
    this.row.message_snowflake = messageSnowflake;
  }

  /** Invite Setter */
  async setWasInvited(was_invited: boolean) {
    await query(`UPDATE invites SET was_invited = $1 WHERE id = ${this.row.id}`, [was_invited]);
    this.row.was_invited = was_invited;
  }

  // set this invite as accepted
  async setAccepted() {
    await query(`UPDATE invites SET accepted = TRUE WHERE id = ${this.row.id}`);
    this.row.accepted = true;
  }
}
