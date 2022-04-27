import { Client, MessageEmbed, TextChannel } from 'discord.js';
import { Scoreboard } from '../../database/models/Scoreboard';
import { setChannelContent } from '../util/ResourceManager';
import { Ctf } from '../../database/models/Ctf';
import { Team } from '../../database/models/Team';
import { User } from '../../database/models/User';
import { Flag } from '../../database/models/Flag';
import { Sequelize } from 'sequelize';
import { formatDistanceToNow } from 'date-fns';

// can't believe this isn't in the stdlib
function arrayChunk<ArrType>(arr: ArrType[], chunksize: number): ArrType[][] {
  return arr.reduce(
    (accum: ArrType[][], curr) => {
      if (accum[accum.length - 1].length < chunksize) accum[accum.length - 1].push(curr);
      else accum.push([curr]);
      return accum;
    },
    [[]],
  );
}

export async function setScoreboardMessage(client: Client<true>, scoreboard: Scoreboard) {
  // TODO: handle grouping, min/max, and category filters

  const channel = await client.channels.fetch(scoreboard.channelSnowflake);
  if (!channel || !(channel instanceof TextChannel)) throw new Error('could not fetch scoreboard channel by snowflake');

  // generate the scoreboard first
  const teams = await scoreboard.getTeamData();

  // we can only fit 8 teams into each embed due to Discord's limit of 25 fields per embed
  const embeds = arrayChunk(teams, 8).map((embed) =>
    new MessageEmbed().setDescription('\u200b').addFields(
      embed
        .map((team, i) => [
          { name: `${i} - ${team.name}`, value: '\u200b', inline: true },
          {
            name: `${team.points} pts`,
            value: `*since ${formatDistanceToNow(team.lastSubmission, { addSuffix: true })}*`,
            inline: true,
          },
          { name: `\u200b`, value: '\u200b', inline: false },
        ])
        .flatMap((t) => t)
        .slice(0, -1),
    ),
  );

  await setChannelContent(client, channel, ...embeds);
}
