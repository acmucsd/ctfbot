import CommandInteraction from '../compat/CommandInteraction';
import { ApplicationCommandDefinition, ApplicationCommandOptionType, CommandOptionMap } from '../compat/types';
import { CTF } from '../../../database/models';

export default {
  name: 'invite',
  description: 'Invites the indicated user to join your team. You must be Team Captain to do this',
  type: ApplicationCommandOptionType.SUB_COMMAND,
  options: [
    {
      name: 'user',
      description: 'The user to invite',
      type: ApplicationCommandOptionType.USER,
      required: true,
    },
  ],
  async execute(interaction: CommandInteraction, options: CommandOptionMap) {
    const ctf = await CTF.fromGuildSnowflakeCTF(interaction.guild.id);
    const team = await ctf.fromUnspecifiedTeam(interaction.member.id, interaction.channel.id);

    const member = interaction.guild.member(options.user.toString());
    const user = await ctf.fromUserSnowflakeUser(member.id);

    // invite the user
    await user.createInvite(interaction.client, team);

    return `User **${member.user.username}** was invited to your team. They will need to accept.`;
  },
} as ApplicationCommandDefinition;
