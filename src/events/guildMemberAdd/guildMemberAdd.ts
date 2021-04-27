import { GuildMember } from 'discord.js';
import { NoTeamUserError, NoUserError } from '../../errors';
import { CTF, TeamServer } from '../../database/models';
import { logger } from '../../log';

const guildMemberAddEvent = async (member: GuildMember) => {
  //   user joins Team Server
  // * if the user does have a corresponding entry in the user database, AND THEY ARE ASSIGNED TO THIS TEAM SERVER, grant their roles
  // * if the user is an admin in the main guild, don't kick
  // * otherwise, send a nice message explanation, then kick
  logger(`${member.user.username} joined ${member.guild.name}`);
  let ctf: CTF;
  try {
    ctf = await CTF.fromGuildSnowflakeCTF(member.guild.id);
  } catch {
    // Not a CTF guild
    return;
  }
  let teamServer: TeamServer;
  try {
    teamServer = await ctf.fromGuildSnowflakeTeamServer(member.guild.id);
  } catch {
    teamServer = null;
  }
  // Check to see if it's a main server: either not a team server or a team server with same id as main
  if (
    !teamServer ||
    ctf.row.guild_snowflake === teamServer.row.guild_snowflake
  ) {
    try {
      // Try to resolve the user
      await ctf.fromUserSnowflakeUser(member.user.id);
      // Give them their main role back
      const team = await ctf.fromUserTeam(member.user.id);
      await member.roles.add(team.row.team_role_snowflake_main);
    } catch (err) {
      if (err instanceof NoUserError) {
        // First time user joining the main ctf server
        await ctf.createUser(member);
      } else if (err instanceof NoTeamUserError) {
        // TODO: User isn't a part of a team but is a part of the ctf
      } else {
        throw err;
      }
    }
  } else if (teamServer) {
    if (
      member.client.guilds
        .resolve(ctf.row.guild_snowflake)
        .members.resolve(member.id)
        ?.roles.cache.find((role) => role.id === ctf.row.admin_role_snowflake)
    ) {
      // They're an admin
      return;
    }
    try {
      await ctf.fromUserSnowflakeUser(member.user.id);
      const team = await ctf.fromUserTeam(member.user.id);
      if (team.row.team_server_id.toString() !== member.guild.id) {
        throw new Error();
      }
      // Give them their team server role back
      await member.roles.add(team.row.team_role_snowflake_main).catch((err) => {
        throw err;
      });
    } catch {
      await member.send('PLACEHOLDER');
      void member.kick('Not a valid user for this team server');
    }
  }
};

export default guildMemberAddEvent;
