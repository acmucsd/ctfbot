import { ButtonInteraction, MessageActionRow, Modal, ModalActionRowComponent, TextInputComponent } from 'discord.js';
import { TextInputStyles } from 'discord.js/typings/enums';

export default async function handleFlagModal(interaction: ButtonInteraction): Promise<string | undefined> {
  if (!interaction.inCachedGuild()) throw new Error('flag modal button somehow not in cached guild');

  // we don't have to check if the user is part of the CTF because it will check that on flag submission anyways
  const modal = new Modal().setTitle('Submit your Flag').setCustomId('flagSubmit');

  const flagTextComponent = new TextInputComponent()
    .setCustomId('flagText')
    .setLabel('Flag Text')
    .setStyle(TextInputStyles.SHORT)
    .setRequired(true)
    .setPlaceholder('sdctf{ ... }');

  const row = new MessageActionRow<ModalActionRowComponent>().addComponents(flagTextComponent);
  modal.addComponents(row);

  await interaction.showModal(modal);

  return;
}
