import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';

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

    team.name = interaction.options.getString('name', true);
    await team.save();

    // trigger leaderboard refresh? nah

    return `Your team has been renamed ${team.name}`;
  },
} as ChatInputCommandDefinition;
