import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'name',
  description: 'Set the name of the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The desired name',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const name = options.name.toString() || '';
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const oldName = ctf.row.name;
    await ctf.setName(name);
    return `CTF name has been changed from **${oldName}** to **${name}**`;
  },
} as ApplicationCommandDefinition;
