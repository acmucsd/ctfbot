import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { createCommandNotExecutedInGuildError } from '../../../../../../errors/CommandInteractionError';
import { CTF } from '../../../../../../database/models/CTF';
import { Op } from 'sequelize';

export default {
  name: 'get',
  description: "Lists all of the team servers belonging to the indicated CTF (defaults to current guild's CTF)",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    if (!interaction.inCachedGuild()) throw createCommandNotExecutedInGuildError(interaction);

    const ctfname = interaction.options.getString('name');
    const ctf = await CTF.findOne({
      where: { [Op.or]: [{ name: ctfname }, { guildSnowflake: interaction.guild.id }] },
    });
    if (!ctf) throw Error('no CTF found');

    const teamServers = await ctf.getTeamServers();
    return teamServers.map((ts) => ts.name).join(', ');
  },
} as ExecutableSubCommandData;
