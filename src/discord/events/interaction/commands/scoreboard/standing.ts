import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'standing',
  description: "Show your current team's standing relative to others teams",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    return 'not yet implemented';
  },
} as ExecutableSubCommandData;
