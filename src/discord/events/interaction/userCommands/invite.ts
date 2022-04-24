import { UserContextMenuInteraction } from 'discord.js';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { Invite } from '../../../../database/models/Invite';
import { sentInviteMessage } from '../../../messages/InviteMessage';

export async function handleInvite(interaction: UserContextMenuInteraction<'cached'>): Promise<string> {
  // get the CTF of this guild
  const ctf = await getCtfByGuildContext(interaction.guild);
  if (!ctf) throw new Error('unable to get ctf of current guild');

  // check to make sure inviter is part of a CTF
  const { user, team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

  // check to make sure invitee is part of CTF
  const { user: targetUser, team: targetTeam } = await ctf.getTeamAndUserFromSnowflake(interaction.targetUser.id);

  // check to make sure the invitee hasn't already joined a team
  const numberOfUsers = await targetTeam.countUsers();
  if (numberOfUsers >= 2) throw new Error('this user has already joined a team');

  // check to make sure this invitee hasn't already been invited by this team
  const existingInvite = await Invite.getInviteByUserAndTeam(targetUser.userSnowflake, team.id);
  if (existingInvite) throw new Error('you have already invited this user');

  // create invitation and send to invitee
  const invitation = Invite.build({ wasInvited: true, accepted: false });
  await invitation.setUser(targetUser, { save: false });
  await invitation.setTeam(team, { save: false });
  await invitation.save();

  // send DM follow up for invite
  await sentInviteMessage(interaction.client, targetUser, team);

  return 'Team invitation sent to their private messages';
}
