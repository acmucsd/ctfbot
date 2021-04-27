import { GuildMember, PartialGuildMember } from 'discord.js';
import { CTF } from '../../database/models';
import { logger } from '../../log';

const guildMemberRemoveEvent = async (
  member: GuildMember | PartialGuildMember,
) => {
  logger(`${member.user.username} left ${member.guild.name}`);
  const ctf = await CTF.fromGuildSnowflakeCTF(member.guild.id);
};

export default guildMemberRemoveEvent;
