import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { debouncedRefreshScoreboard } from '../../../hooks/ScoreboardHooks';
import { Team } from '../../../../database/models/Team';
import { Invite } from '../../../../database/models/Invite';
import { sentInviteMessage } from '../../../messages/InviteMessage';

export default {
  name: 'invite',
  description: 'Invite somebody to your team',
  default_permission: false,
  options: [
    {
      name: 'user',
      description: 'The user to invite',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    // get the CTF of this guild
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('unable to get ctf of current guild');

    // check to make sure inviter is part of a CTF
    const { user, team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

    // check to make sure invitee is part of CTF
    const optionUser = interaction.options.getUser('user', true);
    const { user: targetUser, team: targetTeam } = await ctf.getTeamAndUserFromSnowflake(optionUser.id);

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
    try {
      await sentInviteMessage(interaction.client, targetUser, team);
    } catch (e) {
      await invitation.destroy();
      throw new Error(
        'This user appears to have private messages from non-friends disabled. They need to accept DMs in order to be invited to a team.',
      );
    }

    return 'Team invitation sent to their private messages';
  },
} as ChatInputCommandDefinition;
