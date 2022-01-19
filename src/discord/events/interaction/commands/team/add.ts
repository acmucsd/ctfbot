import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../interaction';

export default {
  name: 'add',
  description: 'Creates an empty team in the indicated server (or current server if none is specified)',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'name',
      description: "The team's name",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
    {
      name: 'server_name',
      description: 'The server to create the team on',
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const serverName = interaction.options.getString('server_name');

    const teamServer =
      (serverName
        ? await ctf.fromNameTeamServer(serverName)
        : (await ctf.getAllTeamServers()).find((server) => server.row.guild_snowflake === interaction.guild.id)) ??
      (await ctf.getTeamServerWithSpace());

    const team = await teamServer.makeTeam(interaction.client, ctf, interaction.options.getString('name', true).trim());
    return `Made new team **${team.row.name}** in **${teamServer.row.name}**`;
  },
} as ExecutableSubCommandData;
