import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { setChannelContent } from '../util/ResourceManager';
import { Challenge } from '../../database2/models/Challenge';

export async function setChallengeMessage(client: Client<true>, channel: TextChannel, challenge: Challenge) {
  const category = await challenge.getCategory();

  const challengeMessage = new MessageEmbed();
  challengeMessage.setTitle(challenge.name);
  challengeMessage.setDescription(challenge.prompt);
  challengeMessage.setAuthor({ name: `${category.name} - ${challenge.difficulty}` });
  challengeMessage.setFooter({ text: `By ${challenge.author}` });
  challengeMessage.setTimestamp();
  challengeMessage.setColor('#50c0bf');

  // const attachments = await this.getAllAttachments();
  // attachments.forEach((attachment) => challengeMessage.addField(attachment.row.name, attachment.row.url));

  // const solvesMessage = new MessageEmbed();
  // const solves = await this.getSolves();

  await setChannelContent(client, channel, challengeMessage);
}
