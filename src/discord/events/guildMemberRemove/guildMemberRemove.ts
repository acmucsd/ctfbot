import { GuildMember, PartialGuildMember } from 'discord.js';
import { logger } from '../../../log';

const guildMemberRemoveEvent = (member: GuildMember | PartialGuildMember) => {
  logger.info(`member left guild`, { member });
};

export default guildMemberRemoveEvent;
