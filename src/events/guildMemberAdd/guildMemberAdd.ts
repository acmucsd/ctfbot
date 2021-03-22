import { GuildMember } from 'discord.js';
import { CTF } from '../../database/models';
import { logger } from '../../log';

const guildMemberAddEvent = async (member: GuildMember) => {
  // User joins a server. This server can either be a main ctf server and/or a team server.
  // If it's the main server, we check if they're a returning user or not.
  //    If they are a returning user, we give them back their relevant roles.
  //    If they are a new user, they get added to the database
  // If it's a team server, we also check if they're a returning user
  //    if they're a returning user, we check to see if they should be in this team server
  //      If their team is on this server we give them the right roles
  logger(`${member.user.username} joined ${member.guild.name}`);
  const ctf = await CTF.fromGuildSnowflakeCTF(member.guild.id);
  const user = await ctf.createUser(member);
};

export default guildMemberAddEvent;
