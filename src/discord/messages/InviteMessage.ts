import { Client, MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import { User } from '../../database/models/User';
import { Team } from '../../database/models/Team';

export async function sentInviteMessage(client: Client<true>, user: User, newTeam: Team) {
  const inviteMessage = new MessageEmbed();
  inviteMessage.setTitle(`You have been invited to join the Team **${newTeam.name}**`);
  inviteMessage.setColor('#50c0bf');

  inviteMessage.description = `You can either **accept** this invitation below, or ignore this message to decline the invitation.`;

  inviteMessage.addField(
    'Warning',
    'If you have already captured flags individually, those captures will be lost when you move to your new team.',
  );

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      // putting the targetTeam id here lets us disambiguate invitation acceptance events later
      .setCustomId(`inviteAccept:${newTeam.id}`)
      .setLabel('Accept Invitation and Join Team')
      .setStyle('PRIMARY'),
  );

  const discordUser = client.users.resolve(user.userSnowflake);
  if (!discordUser) throw new Error('failed to send invite DM');

  await discordUser.send({
    embeds: [inviteMessage],
    components: [row],
  });
}
