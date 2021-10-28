import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

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
    const ctfname = interaction.options.getString('name');
    const ctf = await (ctfname ? CTF.fromNameCTF(ctfname) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));
    ctf.throwErrorUnlessAdmin(interaction);

    return ctf.printAllTeamServers();
  },
} as ExecutableSubCommandData;
