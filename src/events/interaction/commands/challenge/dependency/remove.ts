import { CTF } from '../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'remove',
  description: 'Removes a prerequisite challenge from the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to remove a dependency/prerequisite from',
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
    {
      name: 'prerequisite_challenge',
      description: 'The challenge to remove as a dependency/prerequisite',
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const main = await ctf.fromChannelSnowflakeChallenge(interaction.options.getString('main_challenge', true));
    const prereq = await ctf.fromChannelSnowflakeChallenge(
      interaction.options.getString('prerequisite_challenge', true),
    );
    await main.removeChallengeDependency(prereq);

    return `Challenge **${prereq.row.name}** removed as a prerequesite to challenge **${main.row.name}**.`;
  },
} as ExecutableSubCommandData;
