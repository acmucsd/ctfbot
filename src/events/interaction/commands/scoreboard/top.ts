import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { Challenge, CTF } from '../../../../database/models';

export default {
  name: 'top',
  description: 'Show the top 100 players in this CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    // TODO: this is a temporary way for us to extract the CTFtime standings format
    // this functionality doesn't really reflect what this command should be doing

    const { challengePointMap, challengesByTeams, sortedTeams, pointsPossible } = await ctf.computeStatistics();

    const challenges = await ctf.getAllChallenges();
    const challengeMap = challenges.reduce((accum: { [key: number]: Challenge }, curr) => {
      accum[curr.row.id] = curr;
      return accum;
    }, {});

    const taskStatsByTeam = challengesByTeams.reduce(
      (accum: { [key: number]: { [key: string]: { points: number } } }, curr) => {
        accum[curr.team_id] = accum[curr.team_id] || {};
        const chal = challengeMap[curr.challenge_id];
        accum[curr.team_id][chal.row.name] = { points: challengePointMap[curr.challenge_id] as number };
        return accum;
      },
      {},
    );

    const results = {
      tasks: challenges.map((chal) => chal.row.name),
      standings: sortedTeams.map((team, i) => ({
        pos: `${i + 1}`,
        team: team.name,
        score: team.points,
        taskStats: taskStatsByTeam[team.id] as { [key: string]: { points: number } },
      })),
    };

    console.log(JSON.stringify(results));

    return 'Dumped standings to console';
  },
} as ApplicationCommandDefinition;
