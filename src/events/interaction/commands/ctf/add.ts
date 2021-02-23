import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'add',
  description: 'Creates a new CTF in the current guild',
  type: 1,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: 3,
      required: false,
    },
    {
      name: 'description',
      description: 'An optional description of the CTF',
      type: 3,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const name = (options && options.name) ? options.name as string : interaction.guild.name;
    const description = (options && options.description) ? options.description as string : '';
    const newCTF = await CTF.createCTF(name, interaction.guild.id);
    await newCTF.setDescription(description);
  },
} as ApplicationCommandDefinition;
