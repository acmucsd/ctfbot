import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { getCTFByGuildContext } from '../../../../util/ResourceManager';
import { Challenge } from '../../../../../database2/models/Challenge';

export default {
  name: 'add',
  description: 'Creates a new CTF challenge.',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: "The challenge's name",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'category',
      description: "The challenge's category",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCTFByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this discord guild is not associated with any CTF');

    const challengeName = interaction.options.getString('category', true);
    const categories = await ctf.getCategories({ where: { name: challengeName } });
    if (!categories || !categories[0]) throw new Error('no category by that name in this CTF');

    // TODO: get rid of challenge -> CTF duplicate reference
    const challenge = Challenge.build({ name: interaction.options.getString('name', true) });
    await challenge.setCTF(ctf, { save: false });
    await challenge.setCategory(categories[0], { save: false });
    await challenge.save();

    return `Challenge **${challenge.name}** has been created in category **${challengeName}**.`;
  },
} as ExecutableSubCommandData;
