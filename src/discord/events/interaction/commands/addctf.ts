import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { createCommandNotExecutedInGuildError } from '../../../../errors/CommandInteractionError';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { CTF } from '../../../../database/models/CTF';

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
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    if (!interaction.inCachedGuild()) throw createCommandNotExecutedInGuildError(interaction);

    const name = interaction.options.getString('name') || interaction.guild.name;
    const newCTF = await CTF.create({ guildSnowflake: interaction.guild.id, name });

    return `Created new CTF **${newCTF.name}** in this server`;
  },
} as ChatInputCommandDefinition;
