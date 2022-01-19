import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'top',
  description: 'Show the top 100 players in this CTF',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    // TODO: this is a temporary way for us to extract the CTFtime standings format
    // this functionality doesn't really reflect what this command should be doing

    // const { challengePointMap, challengesByTeams, sortedTeams, pointsPossible } = await ctf.computeStatistics();
    //
    // const challenges = await ctf.getAllChallenges();
    // const challengeMap = challenges.reduce((accum: { [key: number]: Challenge }, curr) => {
    //   accum[curr.row.id] = curr;
    //   return accum;
    // }, {});
    //
    // const taskStatsByTeam = challengesByTeams.reduce(
    //   (accum: { [key: number]: { [key: string]: { points: number } } }, curr) => {
    //     accum[curr.team_id] = accum[curr.team_id] || {};
    //     const chal = challengeMap[curr.challenge_id];
    //     accum[curr.team_id][chal.row.name] = { points: challengePointMap[curr.challenge_id] };
    //     return accum;
    //   },
    //   {},
    // );
    //
    // const results = {
    //   tasks: challenges.map((chal) => chal.row.name),
    //   standings: sortedTeams.map((team, i) => ({
    //     pos: i + 1,
    //     team: team.name.replace(/[\u{0080}-\u{FFFF}]/gu, (match) => `\\u${match.codePointAt(0)}`),
    //     score: team.points,
    //     taskStats: taskStatsByTeam[team.id] as { [key: string]: { points: number } },
    //   })),
    // };
    //
    // console.log(JSON.stringify(results));

    return 'Dumped standings to console';
  },
} as ExecutableSubCommandData;
