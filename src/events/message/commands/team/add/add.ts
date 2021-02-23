import { Message } from 'discord.js';
import { CTF, TeamServer } from '../../../../../database/models';
import logger from '../../../../../log';

const add = async (message: Message, name: string, server_name?: string) => {
  const teamServer: TeamServer = null; // server_name ? await (await CTF.fromGuildSnowflakeCTF(message.guild.id)).fromNameTeamServer(server_name) : await CTF.fromTGuildSnowflakeTeamServer(message.guild.id);
  if ((await teamServer.getAllTeams()).length >= teamServer.row.team_limit) {
    // Too many teams
  }
  const Team = null; // await teamServer.makeTeam(name);
  logger(`Made new team "${name}" in "${teamServer.row.name}"`);

  const teamServerGuildSnowflake = teamServer.row.guild_snowflake;
  const ctfGuildSnowflake = (await CTF.fromIdCTF(teamServer.row.ctf_id)).row.guild_snowflake;
  const teamServerGuild = message.client.guilds.cache.find((guild) => guild.id === teamServerGuildSnowflake);
  const ctfGuild = message.client.guilds.cache.find((guild) => guild.id === ctfGuildSnowflake);
  const textChannel = await teamServerGuild.channels.create(`${name.toLowerCase().replace(' ', '-')}`);
  await textChannel.setParent(teamServer.row.team_category_snowflake);
  await Team.setTextChannelSnowflake(textChannel.id);
  logger(`Created channel "#${textChannel.name}" for team "${name}" in "${teamServer.row.name}"`);

  const teamServerRole = await teamServerGuild.roles.create({ data: { name: `${name}` } });
  await Team.setTeamRoleSnowflakeTeamServer(teamServerRole.id);
  logger(`Created role "#${name}" in team server "${teamServerGuild.name}"`);

  if (teamServerGuildSnowflake !== ctfGuildSnowflake) {
    const mainRole = await ctfGuild.roles.create({ data: { name: `${name}` } });
    await Team.setTeamRoleSnowflakeMain(mainRole.id);
    logger(`Created role "#${name}" in ctf server "${ctfGuild.name}"`);
  } else {
    await Team.setTeamRoleSnowflakeMain(teamServerRole.id);
  }
};

export default add;
