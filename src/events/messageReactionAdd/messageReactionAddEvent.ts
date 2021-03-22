import { MessageReaction, PartialUser, User } from 'discord.js';
import { logger } from '../../log';
import { CTF } from '../../database/models';

const messageReactionAddEvent = async (reaction: MessageReaction, discordUser: User | PartialUser) => {
  if (reaction.message.webhookID) {
    try {
      const ctf = await CTF.fromWebhookCTF(reaction.message.webhookID);
      const user = await ctf.fromUserSnowflakeUser(discordUser.id);
      if (!user.row.tos_accepted) {
        await user.acceptTOS();
      } else {
        logger(`${discordUser.username} has already accepted TOS`);
      }
    } catch (e) {
      //empty
    }
  }
};

export default messageReactionAddEvent;
