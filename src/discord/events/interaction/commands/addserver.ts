import { CTF } from '../../../../database/models';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'addserver',
  description: 'Adds the current guild as a team server for the indicated CTF',
  options: [
    {
      name: 'limit',
      description: 'The max number of teams allowed to be in the server',
      type: ApplicationCommandOptionTypes.INTEGER,
      required: true,
    },
    {
      name: 'ctf_name',
      description: 'The name of the CTF to add the guild to',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
    {
      name: 'name',
      description: 'The unique identifier the server will be referred to as',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctfname = interaction.options.getString('ctf_name');
    const ctf = await (ctfname ? CTF.fromNameCTF(ctfname) : CTF.fromGuildSnowflakeCTF(interaction.guild.id));

    const name = interaction.options.getString('name') ?? interaction.guild.name;
    const server = await ctf.createTeamServer(
      interaction.guild,
      name,
      interaction.options.getNumber('limit', true),
      interaction.member,
    );
    return `Added Team Server **${server.row.name}** to CTF **${ctf.row.name}** with limit **${server.row.team_limit}**`;
  },
} as ChatInputCommandDefinition;
