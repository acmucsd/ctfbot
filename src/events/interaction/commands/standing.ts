import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import CommandInteraction from '../compat/CommandInteraction';
import { CTF } from '../../../database/models';
import { MessageEmbed, TextChannel } from 'discord.js';

export default {
  name: 'standing',
  description: "Fetch your team's solved challenges and current ranking",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);

    const team = await ctf.fromUnspecifiedTeam(interaction.member.id, interaction.channel.id);

    const { challengePointMap, sortedTeams, pointsPossible } = await ctf.computeStatistics();

    const solvedChallenges = await team.getSolvedChallenges();

    const challengeDetails = solvedChallenges
      .map((chal) => ({ name: chal.row.name, points: challengePointMap[chal.row.id] as number }))
      .sort((chalA, chalB) => chalB.points - chalA.points)
      .map((chal) => `**${chal.name}** (${chal.points})`);

    const userRank = sortedTeams.findIndex((t) => t.id === team.row.id.toString());
    const scoreboardLines = sortedTeams
      // we only want the two teams above and below us
      .slice(Math.max(userRank - 2, 0), Math.min(userRank + 2, sortedTeams.length))
      .map(
        (team, i) =>
          `${' '.repeat(3 - `${userRank + i}`.length)}${userRank + i} - ${team.name.substring(0, 30)}${' '.repeat(
            Math.max(35 - team.name.length, 5),
          )}${' '.repeat(5 - `${team.points}`.length)}${team.points}`,
      );

    const message = new MessageEmbed();
    message
      .setTitle(`Team ${team.row.name} Current Standing`)
      .setColor('50c0bf')
      .setDescription(`\`\`\`java\n${scoreboardLines.join('\n') || 'No challenges submitted'}\n\`\`\``);
    if (challengeDetails.length > 0)
      message.addField('Current Solved Challenges', challengeDetails.join(', ').substring(0, 1020));

    const teamChannel = interaction.client.channels.resolve(team.row.text_channel_snowflake) as TextChannel;
    await teamChannel.send(message);

    return `Team standing sent to team channel <#${team.row.text_channel_snowflake}>.`;
  },
} as ApplicationCommandDefinition;
