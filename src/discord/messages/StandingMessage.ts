import { MessageEmbed, TextChannel } from 'discord.js';
import { Ctf } from '../../database/models/Ctf';
import { Team } from '../../database/models/Team';
import { generateFieldsForTeamScoreboard } from './ScoreboardMessage';
import { Challenge } from '../../database/models/Challenge';
import { Flag } from '../../database/models/Flag';
import { User } from '../../database/models/User';
import { Op } from 'sequelize';

export async function sendStandingMessage(teamChannel: TextChannel, ctf: Ctf, team: Team) {
  // generate the scoreboard first
  const teams = await ctf.getTeamData();
  const teamIndex = teams.findIndex((t) => t.id === team.id);
  const surroundingTeams = teams.slice(Math.max(teamIndex - 3, 0), Math.min(teamIndex + 4, teams.length));

  const standingEmbed = new MessageEmbed()
    .setTitle(`Team ${team.name} Current Ranking`)
    .setDescription(`showing the ${surroundingTeams.length} surrounding teams`)
    .setFields(generateFieldsForTeamScoreboard(surroundingTeams));

  // convoluted query designed to fetch all challenges
  // and make it easy to see which ones we have captured
  const categories = await ctf.getCategories({
    attributes: [],
    include: {
      model: Challenge,
      attributes: ['name'],
      where: {
        // only get challenges that are published
        publishTime: {
          [Op.lte]: new Date(),
        },
      },
      include: [
        {
          attributes: ['pointValue'],
          model: Flag,
          include: [
            {
              attributes: ['id'],
              model: User,
              include: [
                {
                  attributes: ['id'],
                  model: Team,
                  required: true,
                  where: {
                    id: team.id,
                  },
                },
              ],
            },
          ],
        },
      ],
    },
  });

  // convert challenges to textual representations
  const challenges = categories.flatMap((category) => category.Challenges || []);
  const lines = challenges.map((chal) => {
    const flags = chal.Flags || [];
    const [earnedPoints, totalPoints] = flags.reduce(
      (accum, flag) => [
        accum[0] + (flag.Users && flag.Users.length > 0 ? flag.pointValue : 0),
        accum[1] + flag.pointValue,
      ],
      [0, 0],
    );
    return `${flags.map((flag) => (flag.Users && flag.Users.length > 0 ? '🟢' : '🔴')).join('')} **${chal.name}** (${
      earnedPoints === totalPoints || earnedPoints === 0 ? totalPoints : `${earnedPoints}/${totalPoints}`
    })`;
  });

  const challengeStatusEmbed = new MessageEmbed().setTitle('Challenges Completed').setDescription(lines.join('\n'));

  await teamChannel.send({ embeds: [standingEmbed, challengeStatusEmbed] });
}
