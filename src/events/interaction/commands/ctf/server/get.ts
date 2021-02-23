import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'get',
  description: 'Lists all of the team servers belonging to the indicated CTF (defaults to current guild\'s CTF)',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: 3,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await ((options) ? CTF.fromNameCTF(options.name as string) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));
    return ctf.printAllTeamServers();
  },
} as ApplicationCommandDefinition;
