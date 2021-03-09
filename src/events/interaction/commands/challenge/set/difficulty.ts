import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'difficulty',
  description: 'Sets the difficulty of the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'difficulty',
      description: "The challenge's difficulty",
      type: ApplicationCommandOptionType.STRING,
      required: true,
      choices: [
        {
          name: 'Baby',
          value: '0',
        },
        {
          name: 'Easy',
          value: '1',
        },
        {
          name: 'Medium',
          value: '2',
        },
        {
          name: 'Hard',
          value: '3',
        },
      ],
    },
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionType.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    return `This command has not been implemented yet`;
  },
};
