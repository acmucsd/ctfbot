import { Message } from 'discord.js';

import add from './add';
import del from './del';
import get from './get';
import invite from './invite';
import join from './join';
import set from './set';
import user from './user';

const team = async (message: Message, prefixLength: number) => {
  const args = message.content.substr(prefixLength).trim().split(' ');
  switch (args[1].toLowerCase()) {
    case 'add':
      if (!args[3]) {
        await add(message, args[2]);
      } else {
        await add(message, args[2], args[3]);
      }
      break;
    case 'set':
      break;
    case 'get':
      await get(message);
      break;
    case 'user':
      break;
    case 'del':
      // if (args[2]) {
      //   await del(message);
      // } else {
      //   await del(message, args[2]);
      // }
      break;
    default:
      break;
  }
};

export default team;
