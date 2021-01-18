import { Message } from 'discord.js';

const ping = (message: Message) => {
  message.channel.send('pong').then(() => {}).catch(() => {});
};

export default ping;
