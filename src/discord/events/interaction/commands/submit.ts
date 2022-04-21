import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';

export default {
  name: 'submit',
  description: 'Submits a flag for any challenge',
  default_permission: false,
  options: [
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this guild does not belong to a ctf');

    const flag = ctf.getFlag(interaction.options.getString('flag', true));

    return 'to be implemented';
  },
} as ChatInputCommandDefinition;
