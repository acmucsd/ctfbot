import { CTF } from '../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { createCommandNotExecutedInGuildError } from '../../../errors/CommandInteractionError';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'addctf',
  description: 'Creates a new CTF in the current guild',
  options: [
    {
      name: 'name',
      description: 'The name of the CTF',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
    {
      name: 'description',
      description: 'An optional description of the CTF',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    if (!interaction.inCachedGuild()) throw createCommandNotExecutedInGuildError(interaction);

    const name = interaction.options.getString('name') ?? interaction.guild.name;
    const description = interaction.options.getString('description') ?? '';

    const newCTF = await CTF.createCTF(interaction.client, name, interaction.guild.id, interaction.member);
    await newCTF.setDescription(description);
    const printString = `Created new CTF **${newCTF.row.name}** with `;
    return printString
      .concat(description ? `description **${description}**` : `no description`)
      .concat(' in this server');
  },
} as ChatInputCommandDefinition;
