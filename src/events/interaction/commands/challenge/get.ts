import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'get',
  description: 'Gives info on the indicated challenge, and if none is specified returns all challenges in the CTF',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'challenge_name',
      description: 'The challenge to get info on',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    return `This command has not been implemented yet`;
  },
};
