import CommandInteraction from '../../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import { CTF } from '../../../../../database/models';

export default {
  name: 'description',
  description: 'Set the description of the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'description',
      description: 'The desired description',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const description = options.description.toString() || '';
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    await ctf.setDescription(description);
    return `this command (${interaction.commandID}) has not been implemented yet`;
  },
} as ApplicationCommandDefinition;
