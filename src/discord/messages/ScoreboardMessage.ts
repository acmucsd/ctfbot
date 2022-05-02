import { Client, EmbedFieldData, MessageEmbed, TextChannel } from 'discord.js';
import { Scoreboard } from '../../database/models/Scoreboard';
import { setChannelContent } from '../util/ResourceManager';
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
  const channel = await client.channels.fetch(scoreboard.channelSnowflake);
  if (!channel || !(channel instanceof TextChannel)) throw new Error('could not fetch scoreboard channel by snowflake');

  // generate the scoreboard first
  const teams = await scoreboard.getTeamData();

  // we can only fit 8 teams into each embed due to Discord's limit of 25 fields per embed
  const embeds = arrayChunk(teams, 8).map((embed, i) =>
    new MessageEmbed().setDescription('\u200b').addFields(generateFieldsForTeamScoreboard(embed, i * 8)),
  );

  await setChannelContent(client, channel, ...embeds);
}

export function generateFieldsForTeamScoreboard(
  teams: { name: string; lastSubmission: Date; points: number }[],
  offset = 0,
): EmbedFieldData[] {
  return teams
    .map((team, i) => [
      { name: `${offset + i} - ${team.name}`, value: '\u200b', inline: true },
      { name: `\u200b`, value: '\u200b', inline: true },
      {
        name: `${team.points} pts`,
        value: `*since ${formatDistanceToNow(team.lastSubmission, { addSuffix: true })}*`,
        inline: true,
      },
    ])
    .flat();
}
