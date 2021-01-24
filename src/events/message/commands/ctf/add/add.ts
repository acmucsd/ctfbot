import { Message } from 'discord.js';
import ctf from '../../../../../database/models/ctf';

const add = async (message: Message, name: string, description?: string) => {
  const newCTF = await ctf.createCTF(name, message.guild.id);
  void newCTF.setDescription(description ?? '');
};

export default add;
