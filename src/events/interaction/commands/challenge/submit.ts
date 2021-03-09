import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'submit',
  description: "Submits a challenge's flag",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'challenge_name',
      description: 'The challenge being attempted',
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    return `This command has not been implemented yet`;
  },
};
