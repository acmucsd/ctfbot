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

    // is after the publish date
    if (ctf.row?.start_date < new Date()) throw new Error('ctf has not yet been published');

    // is a user in this CTF
    const user = await ctf.fromUserSnowflakeUser(interaction.member.id);

    // has this team already solved this challenge?

    const flag = options.flag.toString();
    const challengeChannelSnowflake = options.challenge_channel.toString();
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);

    const realFlag = Buffer.from(challenge.row.flag);
    const providedFlag = Buffer.from(flag);

    // use timing-safe comparision to verify if the flag is correct
    if (realFlag.length === providedFlag.length && timingSafeEqual(realFlag, providedFlag)) {
      await user.createAttempt(challenge.row.id, flag, true, new Date());
      return `**Congratulations!** 🎉 You captured the flag for **${challenge.row.name}**`;
    }

    await user.createAttempt(challenge.row.id, flag, false, new Date());
    const attempts = await user.getAllAttempts();
    return `Sorry, your submission was incorrect! You have made ${attempts.length} attempts.`;
  },
};
