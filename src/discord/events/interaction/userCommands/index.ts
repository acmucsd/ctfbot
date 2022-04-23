import { UserContextMenuInteraction } from 'discord.js';
import { sendErrorMessageForInteraction } from '../../../util/ResourceManager';
import { embedify } from '../../../../log';
import { handleInvite } from './invite';
import { ApplicationCommandType } from 'discord-api-types/v10';

const userInteractionHandlers: {
  [key: string]: (interaction: UserContextMenuInteraction<'cached'>) => Promise<string>;
} = {
  'Invite to your Team': handleInvite,
};

export async function handleUserInteraction(interaction: UserContextMenuInteraction<'cached'>) {
  // send that we're loading the response to this, but we aren't ready to send it.
  await interaction.deferReply({ ephemeral: true });

  try {
    const result = await userInteractionHandlers[interaction.commandName](interaction);
    await interaction.editReply({
      embeds: [
        embedify({
          description: result,
          title: 'Success',
          color: '#50c0bf',
        }),
      ],
    });
  } catch (e) {
    await sendErrorMessageForInteraction(interaction, e as Error);
  }
}

// this can be passed directly to command registration
export const userContextMenuCommands = Object.keys(userInteractionHandlers).map((name) => ({
  name,
  type: ApplicationCommandType.User,
}));
