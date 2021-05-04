import { logger } from '../../log/';
import query from '../../database';
import { CTF, Invite } from '../../database/models';
import { CTFRow, InviteRow } from '../../database/schemas';

const initializeReactionListeners = async () => {
  logger('Registering TOS reaction listeners...');
  const { rows } = await query(`SELECT * from ctfs`);
  const ctfs = rows.map((row) => new CTF(row as CTFRow));
  ctfs.forEach((ctf) => ctf.registerTOSListener());
  logger('Registered all TOS listeners!');

  logger('Registering invite listeners....');
  const { rows: inviteRows } = await query(`SELECT * from invites WHERE accepted = FALSE`);
  const invites = inviteRows.map((row) => new Invite(row as InviteRow));
  invites.forEach((invite) => invite.registerInviteReactionListener());
  logger('Registered all invite listeners!');
};

export default initializeReactionListeners;
