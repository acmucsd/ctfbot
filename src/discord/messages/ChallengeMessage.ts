import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { setChannelContent } from '../util/ResourceManager';
import { Challenge } from '../../database/models/Challenge';
import { Ctf } from '../../database/models/Ctf';
import { User } from '../../database/models/User';
import { Team } from '../../database/models/Team';
import { format } from 'date-fns';

export async function setChallengeMessage(client: Client<true>, channel: TextChannel, challenge: Challenge) {
  const category = await challenge.getCategory({
    attributes: ['name'],
    include: { model: Ctf, attributes: ['guildSnowflake'] },
  });
  if (!category.Ctf) throw new Error('unexpected null ctf');

  const challengeMessage = new MessageEmbed();

  challengeMessage.setTitle(
    challenge.publishTime
      ? challenge.publishTime <= new Date()
        ? challenge.name
        : `${challenge.name} - Scheduled for ${format(challenge.publishTime, 'hh:mm:ss aa MMM do u')}`
      : `(DRAFT) ${challenge.name}`,
  );
  challengeMessage.setDescription(challenge.prompt);
  challengeMessage.setAuthor({ name: `${category.name} - ${challenge.difficulty}` });
  challengeMessage.setFooter({ text: `By ${challenge.author}` });
  challengeMessage.setColor('#50c0bf');

  // add challenge fields
  const fields = await challenge.getChallengeFields();
  fields.forEach((field) => challengeMessage.addField(field.title, field.content));

  const guild = await client.guilds.fetch(category.Ctf.guildSnowflake);

  // complicated nested query to fetch the associated first blood user and team, if defined
  // todo: needs to actually get first blood, ordering is kinda screwy
  const flags = await challenge.getFlags({
    attributes: ['id', 'pointValue'],
    include: {
      model: User,
      attributes: ['id'],
      through: {
        attributes: ['createdAt'],
      },
      include: [{ model: Team, attributes: ['name'] }],
    },
  });

  const flagMessages = await Promise.all(
    flags.map(async (flag, i) => {
      const flagMessage = new MessageEmbed();

      flagMessage.addField('Current # of Solves', `${flag.Users?.length || 0}`, true);
      flagMessage.addField('Flag Point Value', `${flag.pointValue}`, true);
      flagMessage.setColor('#e91e62');

      // if no captures
      if (!flag.Users || flag.Users.length === 0) {
        flagMessage.setTitle(
          `🚨 ${flags.length === 1 ? `This challenge` : `Flag #${i + 1}`} currently has no captures! 🚨`,
        );
        flagMessage.setDescription('Do you have what it takes to be the first?');
        return flagMessage;
      }

      // if captured
      const user = flag.Users[0];
      if (!user) throw new Error('unable to get capture user');
      const team = user.Team;
      if (!team) throw new Error('unable to get capture team');
      const member = await guild.members.fetch(user.userSnowflake);

      flagMessage.setTitle(
        `🔓 ${flags.length === 1 ? `This challenge's flag` : `Flag #${i + 1}`} has been captured! 🔓`,
      );
      flagMessage.setDescription(`The first to capture this flag was **${member.displayName}** from **${team.name}**`);
      return flagMessage;
    }),
  );

  await setChannelContent(client, channel, challengeMessage, ...flagMessages);
}
