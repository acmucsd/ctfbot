import { parse } from 'date-fns';

import { CTF } from '../../../../../database/models';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

export default {
  name: 'start',
  description: 'Set the start date for the CTF. If no date is indicated, sets it to now',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'start_date',
      description: "The desired start date in a 'YYYY MM DD HH:mm' format",
      type: ApplicationCommandOptionTypes.STRING,
      required: false,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const startDate = interaction.options.getString('start_date');
    const date = startDate ? parse(startDate, 'yyyy MM dd HH:mm', new Date()) : new Date();
    if (date.toString() === 'Invalid Date') throw new Error('Date provided is not valid');

    await ctf.setStartDate(date);

    // todo: stick this mess in ctf.publish or something
    // if (!startDate) {
    //   // loop through every Challenge_Channel and add permission Participant: can view
    //   const teamServers = await ctf.getAllTeamServers();
    //   const challengesWithPrereqs = new Set(await Challenge.getChallengeIDsWithDependencies());
    //   for (const teamServer of teamServers) {
    //     const challengeChannels = await teamServer.getAllChallengeChannels();
    //     for (const channel of challengeChannels) {
    //       // only publish challenges that don't have prereqs
    //       if (!challengesWithPrereqs.has(channel.challenge_id)) {
    //         await (interaction.client.channels.resolve(channel.channel_snowflake) as TextChannel).updateOverwrite(
    //           teamServer.getGuild(interaction.client).roles.resolve(teamServer.row.participant_role_snowflake),
    //           {
    //             VIEW_CHANNEL: true,
    //           },
    //         );
    //       }
    //     }
    //   }
    // }

    return `CTF start date has been changed to **${date.toString()}**`;
  },
} as ExecutableSubCommandData;
