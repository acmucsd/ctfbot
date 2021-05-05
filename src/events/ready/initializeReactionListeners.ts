import { logger } from '../../log/';
import { CTF, Invite } from '../../database/models';

const initializeReactionListeners = async () => {
  logger('Registering TOS reaction listeners...');
  const ctfs = await CTF.allCTFs();
  ctfs.forEach((ctf) => ctf.registerTOSListener());

  logger('Registering invite listeners...');
  const invites = await Invite.allPendingInvites();
  invites.forEach((invite) => invite.registerInviteReactionListener());

  logger('Registered all reaction listeners!');
};

export default initializeReactionListeners;
