import { CTF } from '../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'submit',
  description: "Submits a challenge's flag",
  type: ApplicationCommandOptionTypes.SUB_COMMAND,
  options: [
    {
      name: 'challenge_channel',
      description: 'The challenge being attempted',
      type: ApplicationCommandOptionTypes.CHANNEL,
      required: true,
    },
    {
      name: 'flag',
      description: "The challenge's flag",
      type: ApplicationCommandOptionTypes.STRING,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const user = await ctf.fromUserSnowflakeUser(interaction.member.user.id);

    const flag = interaction.options.getString('flag', true);
    const challengeChannelSnowflake = interaction.options.getString('challenge_channel', true);
    const challenge = await ctf.fromChannelSnowflakeChallenge(challengeChannelSnowflake);

    const attempt = await challenge.submitFlag(interaction.client, user, flag);

    return attempt.row.successful ? 'Flag submission was **correct**!' : 'Flag submission was **incorrect**...';
  },
};
