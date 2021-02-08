import { Message } from 'discord.js';
import ctf from '../../../../../database/models/ctf';

const del = async (message: Message) => {
  const CTF = await ctf.fromGuildSnowflakeCTF(message.guild.id);
  await CTF.deleteCTF();
};

export default del;
