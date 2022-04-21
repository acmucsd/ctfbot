import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { Ctf } from '../../../../../database/models/Ctf';

export default {
  name: 'del',
  description: "Causes the removal of the current guild's CTF and all associated Teams, Categories, and Challenges.",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await Ctf.findOne({ where: { guildSnowflake: interaction.guild.id } });
    if (!ctf) return `This guild is not the main server for any CTFs`;

    const { name } = ctf;
    await ctf.destroy();
    return `Deleted CTF **${name}**`;
  },
} as ExecutableSubCommandData;
