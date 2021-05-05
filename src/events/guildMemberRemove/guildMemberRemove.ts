import { GuildMember, PartialGuildMember } from 'discord.js';
import { logger } from '../../log';

const guildMemberRemoveEvent = (member: GuildMember | PartialGuildMember) => {
  logger(`${member.user.username} left ${member.guild.name}`);
};

export default guildMemberRemoveEvent;
