import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { debouncedRefreshScoreboard } from '../../../hooks/ScoreboardHooks';
import { Team } from '../../../../database/models/Team';

export default {
  name: 'setname',
  description: "Changes the team's name",
  default_permission: false,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this guild does not belong to a ctf');
    // check to make sure user is a part of this ctf
    const { team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);
    const teamName = interaction.options.getString('name', true);

    // check to make sure this name is not taken
    const teamServers = await ctf.getTeamServers({
      attributes: [],
      include: [
        {
          model: Team,
          required: true,
          attributes: ['id'],
          where: {
            name: teamName,
          },
        },
      ],
    });
    if (teamServers.length > 0) throw new Error('There is already another team with that name');

    team.name = teamName;
    await team.save();

    // trigger leaderboard refresh
    const scoreboards = await ctf.getScoreboards({ attributes: ['id'] });
    scoreboards.forEach((scoreboard) => debouncedRefreshScoreboard(scoreboard.id, interaction.client));

    return `Your team has been renamed ${team.name}`;
  },
} as ChatInputCommandDefinition;
