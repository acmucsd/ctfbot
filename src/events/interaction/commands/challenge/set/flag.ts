import { ApplicationCommandOptionType, CommandOptionMap } from '../../../compat/types';
import CommandInteraction from '../../../compat/CommandInteraction';
import { CTF } from '../../../../../database/models';

export default {
  name: 'flag',
  description: "Sets the challenge's flag",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
    {
      name: 'challenge_channel',
      description: "The challenge's current name",
      type: ApplicationCommandOptionType.CHANNEL,
      required: false,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    ctf.throwErrorUnlessAdmin(interaction);

    const newFlag = options.newFlag.toString();
    const challengeChannelSnowflake = options.challenge_channel.toString() ?? interaction.channel.id;
    if (!challengeChannelSnowflake)
      throw new Error('could not determine challenge, try providing challenge_channel parameter');

    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    await challenge.setFlag(newFlag);

    return `Challenge flag has been set to **${newFlag}**.`;
  },
};
