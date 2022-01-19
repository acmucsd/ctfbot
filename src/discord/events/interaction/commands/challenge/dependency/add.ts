import { CTF } from '../../../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ExecutableSubCommandData, PopulatedCommandInteraction } from '../../../interaction';

export default {
  name: 'add',
  description: 'Adds a prerequisite challenge to the indicated challenge',
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to add a dependency/prerequisite to',
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
    {
      name: 'prerequisite_challenge',
      description: 'The challenge to add as a dependency/prerequisite',
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
    await main.addChallengeDependency(prereq);

    return `Challenge **${prereq.row.name}** added as a prerequesite to challenge **${main.row.name}**.`;
  },
} as ExecutableSubCommandData;
