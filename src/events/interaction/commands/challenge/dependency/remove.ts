import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'remove',
  description: 'Removes a prerequisite challenge from the indicated challenge',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'main_challenge',
      description: 'The challenge to remove a dependency/prerequisite from',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
    {
      name: 'prerequisite_challenge',
      description: 'The challenge to remove as a dependency/prerequisite',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const main = await ctf.fromChannelSnowflakeChallenge(options.main_challenge as string);
    const prereq = await ctf.fromChannelSnowflakeChallenge(options.prerequisite_challenge as string);
    await main.removeChallengeDependency(prereq);
  },
};
