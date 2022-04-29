import { ChatInputCommandDefinition, PopulatedCommandInteraction } from '../interaction';
import { getCtfByGuildContext } from '../../../util/ResourceManager';
import { sendStandingMessage } from '../../../messages/StandingMessage';
import { TextChannel } from 'discord.js';

export default {
  name: 'standing',
  description: "Fetch your team's solved challenges and current ranking",
  default_permission: false,
  async execute(interaction: PopulatedCommandInteraction) {
    const ctf = await getCtfByGuildContext(interaction.guild);
    if (!ctf) throw new Error('this guild does not belong to a ctf');
    // check to make sure user is a part of this ctf
    const { team } = await ctf.getTeamAndUserFromSnowflake(interaction.user.id);

    // send follow-up message to team channel
    const teamChannel = await interaction.client.channels.fetch(team.textChannelSnowflake);
    if (teamChannel && teamChannel instanceof TextChannel) await sendStandingMessage(teamChannel, ctf, team);

    return 'Standing message delivered';
  },
} as ChatInputCommandDefinition;
