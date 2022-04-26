import handleTosAgree from './tosAgree';
import { ButtonInteraction } from 'discord.js';
import { sendErrorMessageForInteraction } from '../../../util/ResourceManager';
import { embedify } from '../../../../log';
import handleInviteAccept from './inviteAccept';
import handleFlagModal from './flagModal';

const buttonHandlers: {
  [key: string]: {
    handler: (interaction: ButtonInteraction, id: string) => Promise<string | undefined>;
    skipDefer?: boolean;
  };
} = {
  tosAgree: { handler: handleTosAgree },
  inviteAccept: { handler: handleInviteAccept },
  flagModal: { handler: handleFlagModal, skipDefer: true },
};

export async function handleButtonInteraction(interaction: ButtonInteraction) {
  try {
    // button customIds are often stored as "tag:id" strings where the tag
    // designates the function and the id designates the database id associated
    const parsedId = interaction.customId.split(':');
    const key = parsedId[0];
    const id = parsedId[1] || '';

    const handlerConfig = buttonHandlers[key];

    // send that we're loading the response to this, but we aren't ready to send it.
    if (!handlerConfig.skipDefer) await interaction.deferReply({ ephemeral: true });

    const result = await handlerConfig.handler(interaction, id);
    // if this result returned undefined, we'll assume a reply was already sent manually
    if (!result) return;
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
