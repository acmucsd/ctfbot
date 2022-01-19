import { CTF } from '../../../../database/models';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';

export default {
  name: 'invite',
  description: 'Invites the indicated user to join your team. You must be Team Captain to do this',
  options: [
    {
      name: 'user',
      description: 'The user to invite',
      type: ApplicationCommandOptionTypes.USER,
      required: true,
    },
  ],
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.user.id, interaction.channelId);

    const member = interaction.guild.members.resolve(interaction.options.getUser('user', true));

    if (!member) throw new Error('invited player is not in your current Discord server');

    const user = await ctf.fromUserSnowflakeUser(member.user.id);

    // invite the user
    await user.createInvite(interaction.client, team);

    return `User **${member.user.username}** was invited to your team. They will need to accept.`;
  },
} as ChatInputCommandDefinition;
