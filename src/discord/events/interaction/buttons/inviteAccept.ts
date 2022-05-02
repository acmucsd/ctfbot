import { ButtonInteraction } from 'discord.js';
import { Team } from '../../../../database/models/Team';
import { TeamServer } from '../../../../database/models/TeamServer';
import { Ctf } from '../../../../database/models/Ctf';
import { Invite } from '../../../../database/models/Invite';
import { sentInviteAcceptanceMessages } from '../../../messages/InviteAcceptanceMessage';

export default async function handleInviteAccept(interaction: ButtonInteraction, id: string): Promise<string> {
  const targetTeam = await Team.findByPk(id, { include: [{ model: TeamServer, include: [Ctf] }] });
  if (!targetTeam) throw new Error('team no longer exists');

  const ctf = targetTeam.TeamServer?.Ctf;
  if (!ctf || !targetTeam.TeamServer) throw new Error("can't determine original CTF");

  const { user, team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

  // check if user is on team by themselves
  const numberOfUsers = await team.countUsers();
  if (numberOfUsers >= 2) throw new Error('you have already joined a team');

  // make sure we can still find the original invite
  const invite = await Invite.getInviteByUserAndTeam(user.userSnowflake, targetTeam.id);
  if (!invite) throw new Error('invite no longer valid');

  // get old teamserver for later
  const oldTeamserver = await team.getTeamServer();
  const oldTeamServerGuild = await interaction.client.guilds.fetch(oldTeamserver.guildSnowflake);

  // remove user from their current team and add to new team
  await user.setTeam(targetTeam);

  // delete old team
  await team.destroy();

  // remove their current flag captures
  await user.removeFlags();

  // update invite
  invite.accepted = true;
  await invite.save();

  // kick from old team server
  try {
    const oldMember = await oldTeamServerGuild.members.fetch(interaction.user.id);
    await oldMember.kick('You have been moved to another Team Server');
  } catch (e) {
    /* if this throws an error, they weren't in the server */
  }

  // invite to new team server
  await sentInviteAcceptanceMessages(interaction.client, user, targetTeam, targetTeam.TeamServer.serverInvite);

  return `You have been added to the team ${targetTeam.name}.`;
}
