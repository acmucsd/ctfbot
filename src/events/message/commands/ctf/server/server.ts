import { Message } from 'discord.js';

import get from './get';
import add from './add';
import del from './del';

const server = (message: Message, prefixLength: number) => {
  const args = message.content.substr(prefixLength).trim().split(' ');

  switch (args[2]) {
    case 'add':
      // await add(message, args[3], args[4], args[5]);
      break;
    case 'del':
      // await del(message, args[3]);
      break;
    case 'get':
      if (args[3]) {
        // await get(message, args[3]);
      } else {
        // await get(message);
      }
      break;
    default:
      break;
  }
};

export default server;
