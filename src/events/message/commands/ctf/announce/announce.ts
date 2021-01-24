import { Message } from 'discord.js';
import ctf from '../../../../../database/models/ctf';

const announce = async (message: Message, messageToSend: string) => {
  const CTF:ctf = await ctf.fromGuildSnowflake(message.guild.id);
  await CTF.setDescription(messageToSend);
};

export default announce;
