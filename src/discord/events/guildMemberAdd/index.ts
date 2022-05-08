import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import { logger } from '../../../log';
import { User } from '../../../database/models/User';
import { refreshTeam } from '../../hooks/TeamHooks';
import { TeamServer } from '../../../database/models/TeamServer';

export const handleGuildMemberAdd = async (member: GuildMember | PartialGuildMember, client: Client<true>) => {
  logger.info(`member joined guild`, { member });

  // is this server a team server?
  const teamServer = await TeamServer.findOne({
    where: { guildSnowflake: member.guild.id },
  });

  // ignore if this server is not a team server
  if (!teamServer) return;

  // get the players team on this server, IF IT EXISTS
  const teams = await teamServer.getTeams({
    include: [
      {
        model: User,
        required: true,
        where: {
          userSnowflake: member.user.id,
        },
      },
    ],
  });

  // if the member's team is not on this server, kick
  if (teams.length === 0) {
    await member.kick('You are not assigned to this team server');
    return;
  }

  //otherwise, refresh this team to re-grant access
  try {
    await refreshTeam(teams[0], client);
  } catch (e) {
    console.log('issue refreshing team:', e);
  }
};
