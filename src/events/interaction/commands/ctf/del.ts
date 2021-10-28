import { CTF } from '../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'del',
  description: "Causes the removal of the current guild's CTF and all associated Teams, Categories, and Challenges.",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);
    await ctf.deleteCTF(interaction.client);
    return `Deleted CTF **${ctf.row.name}**`;
  },
} as ExecutableSubCommandData;
