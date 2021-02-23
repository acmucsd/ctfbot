import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'del',
  description: 'Causes the removal of the current guild\'s CTF and all associated Teams, Categories, and Challenges.',
  type: 1,
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    await ctf.deleteCTF();
  },
} as ApplicationCommandDefinition;
