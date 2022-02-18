import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { setChannelContent } from '../util/ResourceManager';
import { Challenge } from '../../database2/models/Challenge';
import { FlagCapture } from '../../database2/models/FlagCapture';
import { User } from '../../database2/models/User';
import { Team } from '../../database2/models/Team';

export async function setChallengeMessage(client: Client<true>, channel: TextChannel, challenge: Challenge) {
  const category = await challenge.getCategory({ attributes: ['name'] });

  const challengeMessage = new MessageEmbed();
  challengeMessage.setTitle(challenge.name);
  challengeMessage.setDescription(challenge.prompt);
  challengeMessage.setAuthor({ name: `${category.name} - ${challenge.difficulty}` });
  challengeMessage.setFooter({ text: `By ${challenge.author}` });
  challengeMessage.setColor('#50c0bf');

  // const attachments = await this.getAllAttachments();
  // attachments.forEach((attachment) => challengeMessage.addField(attachment.row.name, attachment.row.url));

  const ctf = await challenge.getCTF({ attributes: ['guildSnowflake'] });
  const guild = await client.guilds.fetch(ctf.guildSnowflake);

  // complicated nested query to fetch the associated first blood user and team, if defined
  const flags = await challenge.getFlags({
    attributes: ['id', 'pointValue'],
    order: [[User, 'FlagCaptures', 'createdAt', 'ASC']],
    include: {
      model: User,
      limit: 1,
      include: [{ model: Team, attributes: ['name'] }],
    },
  });
  const flagMessages = await Promise.all(
    flags.map((flag, i) => {
      const flagMessage = new MessageEmbed();

      // flagMessage.addField('Current # of Solves', `${flag.Solvers?.length || 0}`, true);
      // flagMessage.addField('Flag Point Value', `${flag.pointValue}`, true);
      // flagMessage.setColor('#e91e62');
      //
      // // if no captures
      // if (!flag.FlagCaptures || flag.FlagCaptures.length === 0) {
      //   flagMessage.setTitle(`🚨 Flag #${i + 1} currently has no captures! 🚨`);
      //   flagMessage.setDescription('Do you have what it takes to be the first?');
      //   return flagMessage;
      // }
      //
      // // if captured
      // const flagCapture = flag.FlagCaptures[0];
      // const user = flagCapture.User;
      // if (!user) throw new Error('unable to get capture user');
      // const team = user.Team;
      // if (!team) throw new Error('unable to get capture team');
      // const member = await guild.members.fetch(user.userSnowflake);
      //
      // flagMessage.setTitle(`🔓 Flag #${i + 1} has been captured! 🔓`);
      // flagMessage.setDescription(`The first to capture this flag was **${member.displayName}** from **${team.name}**`);
      return flagMessage;
    }),
  );

  await setChannelContent(client, channel, challengeMessage, ...flagMessages);
}
