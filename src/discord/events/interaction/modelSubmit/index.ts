import { ModalSubmitInteraction } from 'discord.js';
import { sendErrorMessageForInteraction } from '../../../util/ResourceManager';
import { embedify } from '../../../../log';
import { handleFlagSubmit } from './flagSubmit';

const modelSubmitHandlers: {
  [key: string]: (interaction: ModalSubmitInteraction<'cached'>, id: string) => Promise<string>;
} = {
  flagSubmit: handleFlagSubmit,
};

export async function handleModelSubmitInteraction(interaction: ModalSubmitInteraction<'cached'>) {
  // send that we're loading the response to this, but we aren't ready to send it.
  await interaction.deferReply({ ephemeral: true });

  // button customIds are often stored as "tag:id" strings where the tag
  // designates the function and the id designates the database id associated
  const parsedId = interaction.customId.split(':');
  const key = parsedId[0];
  const id = parsedId[1] || '';

  try {
    const result = await modelSubmitHandlers[key](interaction, id);
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
