import { CTF } from '../../../database/models';
import { MessageEmbed, TextChannel } from 'discord.js';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'standing',
  description: "Fetch your team's solved challenges and current ranking",
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);

    if (!team.row.text_channel_snowflake) throw new Error('mysteriously not able to find the teams text channel');

    const { challengePointMap, sortedTeams } = await ctf.computeStatistics();

    const solvedChallenges = await team.getSolvedChallenges();
    const challenges = await ctf.getAllChallenges();

    const challengeSummary = challenges.map(
      (challenge) =>
        `${solvedChallenges.find((c) => c.row.id === challenge.row.id) ? ':green_circle:' : ':red_circle:'} **${
          challenge.row.name
        }** (${challengePointMap[challenge.row.id]})`,
    );

    const userRank = sortedTeams.findIndex((t) => t.id === team.row.id.toString());
    const startingRank = Math.max(userRank - 2, 0);
    const scoreboardLines = sortedTeams
      // we only want the two teams above and below us
      .slice(startingRank, Math.min(userRank + 3, sortedTeams.length))
      .map(
        (team, i) =>
          `${' '.repeat(3 - `${startingRank + i}`.length)}${startingRank + i} - ${team.name.substring(
            0,
            30,
          )}${' '.repeat(Math.max(35 - team.name.length, 5))}${' '.repeat(5 - `${team.points}`.length)}${team.points}`,
      );

    const message = new MessageEmbed();
    message
      .setTitle(`Team ${team.row.name} Current Standing`)
      .setColor('#50c0bf')
      .setDescription(
        `\`\`\`java\n${scoreboardLines.join('\n') || 'No challenges submitted'}\n\`\`\`\n${challengeSummary.join(
          '\n',
        )}`,
      );

    const teamChannel = interaction.client.channels.resolve(team.row.text_channel_snowflake) as TextChannel;
    await teamChannel.send({ embeds: [message] });

    return `Team standing sent to team channel <#${team.row.text_channel_snowflake}>.`;
  },
} as ChatInputCommandDefinition;
