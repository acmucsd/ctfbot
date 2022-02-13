import { CTF } from '../../database2/models/CTF';
import { Client } from 'discord.js';
import { destroyCTF, refreshCTF } from './CTFHooks';
import { destroyTeamServer, refreshTeamServer } from './TeamServerHooks';
import { TeamServer } from '../../database2/models/TeamServer';
import { Category } from '../../database2/models/Category';
import { destroyCategory, refreshCategory } from './CategoryHooks';
import { CategoryChannel } from '../../database2/models/CategoryChannel';
import { destroyCategoryChannel, refreshCategoryChannel } from './CategoryChannelHooks';

export async function initHooks(client: Client<true>) {
  CTF.beforeCreate((ctf) => refreshCTF(ctf, client).catch(() => destroyCTF(ctf, client)));
  CTF.beforeUpdate((ctf) => refreshCTF(ctf, client));
  CTF.beforeDestroy((ctf) => destroyCTF(ctf, client));

  TeamServer.beforeCreate((ts) => refreshTeamServer(ts, client).catch(() => destroyTeamServer(ts, client)));
  TeamServer.beforeUpdate((ts) => refreshTeamServer(ts, client));
  TeamServer.beforeDestroy((ts) => destroyTeamServer(ts, client));

  // this one is after create because we need categoryID to be defined before creating CategoryChannels
  Category.afterCreate((cat) => refreshCategory(cat, client));
  Category.afterUpdate((cat) => refreshCategory(cat, client));
  Category.beforeDestroy((cat) => destroyCategory(cat));

  CategoryChannel.beforeCreate((chan) =>
    refreshCategoryChannel(chan, client).catch(() => destroyCategoryChannel(chan, client)),
  );
  CategoryChannel.beforeUpdate((chan) => refreshCategoryChannel(chan, client));
  CategoryChannel.beforeDestroy((chan) => destroyCategoryChannel(chan, client));

  // now, everytime we start up, we should just refresh all of our CTFs and TeamServers anyways
  const ctfs = await CTF.findAll();
  await Promise.all(ctfs.map((ctf) => refreshCTF(ctf, client)));
}
