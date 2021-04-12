import { ApplicationCommandOptionType, CommandOptionMap } from '../../compat/types';
import CommandInteraction from '../../compat/CommandInteraction';
import { CTF } from '../../../../database/models';

export default {
  name: 'submit',
  description: "Submits a challenge's flag",
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'challenge_channel',
      description: 'The challenge being attempted',
      type: ApplicationCommandOptionType.CHANNEL,
      required: true,
    },
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionType.STRING,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    // additional checks
    // + is a user in this ctf
    // etc

    const flag = options.flag.toString();
    const challengeChannelSnowflake = options.challenge_channel.toString();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);
    const user = await ctf.fromUserSnowflakeUser(interaction.user.id);

    if (challenge.row.flag !== flag) {
      await user.createAttempt(challenge.row.id, flag, false, new Date());
      const attempts = await user.getAllAttempts();
      return `Your submission was incorrect! You have made ${attempts.length}`;
    }

    return `This command has not been implemented yet`;
  },
};
