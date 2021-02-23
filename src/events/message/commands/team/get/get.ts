import { Message } from 'discord.js';
import logger from '../../../../../log';
import { CTF, Team } from '../../../../../database/models';

const get = async (message: Message) => {
  let ctf: CTF;
  try {
    ctf = null; // await CTF.fromIdCTF((await CTF.fromGuildSnowflakeTeamServer(message.guild.id)).row.ctf_id);
  } catch {
    ctf = await CTF.fromGuildSnowflakeCTF(message.guild.id);
  }
  const TeamServers = await ctf.getAllTeamServers();
  let Teams: Team[] = [];
  // eslint-disable-next-line
  for (const teamServer of TeamServers) {
    // eslint-disable-next-line
    const teams = await teamServer.getAllTeams();
    Teams = Teams.concat(teams);
  }
  let log = `All teams in ctf "${ctf.row.name}": `;
  // Map then toString
  Teams.forEach((team) => {
    log = log.concat(`${team.row.name}, `);
  });

  logger(log.slice(0, -2));
};

export default get;
