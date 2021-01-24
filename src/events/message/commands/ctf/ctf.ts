import { Message } from 'discord.js';

import add from './add';
import announce from './announce';
import del from './del';
import server from './server';
import set from './set';

const ctf = async (message: Message, prefixLength: number) => {
  const args = message.content.substr(prefixLength).trim().split(' ');

  switch (args[1].toLowerCase()) {
    case 'add':
      if (args[3]) {
        await add(message, args[2]);
      } else {
        await add(message, args[2], message.content.substr(prefixLength + args[0].length + args[1].length + args[2].length + 3));
      }
      break;
    case 'announce':
      await announce(message, message.content.substr(prefixLength + args[0].length + 1));
      break;
    case 'del':
      await del(message);
      break;
    case 'server':
      server(message, prefixLength);
      return;
    case 'set':
      set(message);
      break;
    default:
      break;
  }
};

export default ctf;
