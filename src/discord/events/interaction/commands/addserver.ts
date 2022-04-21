import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { createCommandNotExecutedInGuildError } from '../../../../errors/CommandInteractionError';
import { Ctf } from '../../../../database/models/Ctf';

export default {
  name: 'addserver',
  description: 'Adds the current guild as a team server for the indicated CTF',
  options: [
    {
      name: 'ctf_name',
      description: 'The name of the CTF to add the guild to',
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'name',
      description: 'The unique identifier the server will be referred to as',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    if (!interaction.inCachedGuild()) throw createCommandNotExecutedInGuildError(interaction);

    const ctfname = interaction.options.getString('ctf_name');
    const ctf = await Ctf.findOne({ where: { name: ctfname } });

    if (!ctf) throw Error('no CTF by that name');

    const name = interaction.options.getString('name') || interaction.guild.name;
    const newTeamServer = await ctf.createTeamServer({
      name,
      guildSnowflake: interaction.guild.id,
      adminRoleSnowflake: ctf.adminRoleSnowflake,
      participantRoleSnowflake: ctf.participantRoleSnowflake,
    });

    return `Added Team Server **${newTeamServer.name}** to CTF **${ctf.name}**`;
  },
} as ChatInputCommandDefinition;
