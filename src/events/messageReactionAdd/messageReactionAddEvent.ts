import { MessageReaction, PartialUser, User } from 'discord.js';

interface ReactionListener {
  id: string;
  emoji: string;
  listener: (User) => Promise<boolean>;
}

const reactionListeners = new Map<string, ReactionListener>();
export function registerReactionListener(id: string, emoji: string, listener: (User) => Promise<boolean>) {
  reactionListeners.set(id, { id, emoji, listener });
}

export const deleteReactionListener = (id: string) => reactionListeners.delete(id);

export default async function messageReactionAddEvent(reaction: MessageReaction, discordUser: User | PartialUser) {
  if (reaction.partial) {
    await reaction.fetch();
    await reaction.message.fetch();
  }

  const reactionListener =
    reactionListeners.get(reaction.message.id) || reactionListeners.get(reaction.message.webhookID);
  if (!reactionListener) return;
  if (reaction.emoji.name !== reactionListener.emoji) return;
  if (!reaction.message.author.bot) return;

  // call the listener with the person who reacted
  const shouldDelete = await reactionListener.listener(discordUser);

  // if the listener returns true, that means we should stop listening
  if (shouldDelete) reactionListeners.delete(reactionListener.id);
}
