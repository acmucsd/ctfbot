import { Client, MessageEmbed, TextChannel } from 'discord.js';

/** This function takes in a channel and a series of messages, and does the following:
 * 1) posts the messages provided if the bot currently has no postings in this channel
 * 2) if the bot has already posted messages in this channel, REPLACE (via edit) those messages with the argument messages instead
 * 3) if the bot wants to post fewer messages than before, the extra messages are deleted
 */
export async function setChannelContent(client: Client<true>, channel: TextChannel, ...messages: MessageEmbed[]) {
  const existingMessages = await channel.messages.fetch();
  const botMessages = Array.from(existingMessages.filter((message) => message.author.id === client.user.id).values());

  for (const nextMessageToPost of messages) {
    const nextMessageToEdit = botMessages.pop();
    // if the message already exists, we need to edit it
    if (nextMessageToEdit) {
      await nextMessageToEdit.edit({ embeds: [nextMessageToPost] });
      continue;
    }
    // otherwise, we need to send it
    await channel.send({ embeds: [nextMessageToPost] });
  }

  // whatever messages are left in the array need to be deleted
  while (botMessages.length > 0) await botMessages.pop()?.delete();
}
