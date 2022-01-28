import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { destroyCTF, refreshCTF } from './CTFHooks';

export function initHooks(client: Client<true>) {
  CTF.beforeCreate((ctf) => refreshCTF(ctf, client));
  CTF.beforeUpdate((ctf) => refreshCTF(ctf, client));
  CTF.beforeDestroy((ctf) => destroyCTF(ctf, client));
}
