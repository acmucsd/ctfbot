import { MessageReaction, PartialUser, User } from 'discord.js';
// import { logger } from '../../log';
import { CTF } from '../../database/models';
import { subscribedMessages, subscribedMessageCallback } from '../../';

const messageReactionAddEvent = async (
  reaction: MessageReaction,
  discordUser: User | PartialUser,
) => {
  if (reaction.partial) {
    await reaction.message.fetch();
  }
  if (reaction.partial) await reaction.fetch();
  let key: string;
  if (subscribedMessages.has(reaction.message.id)) {
    key = reaction.message.id;
  } else if (subscribedMessages.has(reaction.message.webhookID)) {
    key = reaction.message.webhookID;
  } else {
    return;
  }
  // eslint-disable-next-line
  const subscribedMessage = subscribedMessages.get(key) as subscribedMessageCallback;
  const ctf = await CTF.fromIdCTF(subscribedMessage.id);
  subscribedMessage.callback.call(ctf, discordUser);
  if (!reaction.message.guild) {
    subscribedMessages.delete(key);
  }
};

export default messageReactionAddEvent;
