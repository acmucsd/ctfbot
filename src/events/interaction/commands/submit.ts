import { ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import CommandInteraction from '../compat/CommandInteraction';
import { CTF } from '../../../database/models';
import { timingSafeEqual } from 'crypto';

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
    const user = await ctf.fromUserSnowflakeUser(interaction.member.id);

    const flag = options.flag.toString();
    const challengeChannelSnowflake = options.challenge_channel.toString();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);

    const attempt = await challenge.submitFlag(interaction.client, user, flag);

    return attempt.row.successful ? 'Flag submission was **correct**!' : 'Flag submission was **incorrect**...';
  },
};
