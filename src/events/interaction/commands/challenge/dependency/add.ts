import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'add',
  description: 'Adds a prerequisite challenge to the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to add a dependency/prerequisite to',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
    {
      name: 'prerequisite_challenge',
      description: 'The challenge to add as a dependency/prerequisite',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const main = await ctf.fromChannelSnowflakeChallenge(options.main_challenge as string);
    const prereq = await ctf.fromChannelSnowflakeChallenge(options.prerequisite_challenge as string);
    await main.addChallengeDependency(prereq);
  },
};
