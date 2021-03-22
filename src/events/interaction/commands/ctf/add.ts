import CommandInteraction from '../../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import { CTF } from '../../../../database/models';

export default {
  name: 'add',
  description: 'Creates a new CTF in the current guild',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
    {
      name: 'description',
      description: 'An optional description of the CTF',
      type: ApplicationCommandOptionType.STRING,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const name = options && options.name ? (options.name as string) : interaction.guild.name;
    const description = options && options.description ? (options.description as string) : '';
    const newCTF = await CTF.createCTF(interaction.client, name, interaction.guild.id);
    void newCTF.setDescription(description);
    const printString = `Created new CTF **${newCTF.row.name}** with `;
    return printString
      .concat(description ? `description **${description}**` : `no description`)
      .concat(' in this server');
  },
} as ApplicationCommandDefinition;
