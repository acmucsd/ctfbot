import CommandInteraction from '../../compat/CommandInteraction';

const ping = (interaction: CommandInteraction) => {
  void interaction.reply('pong');
};

export default ping;
