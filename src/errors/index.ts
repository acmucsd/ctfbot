export { NoTeamUserError } from './NoTeamUserError';
export { NoUserError } from './NoUserError';
export { DupeTeamError } from './DupeTeamError';
export { NoRoomError } from './NoRoomError';
export { DupeChallengeError } from './DupeChallengeError';

export default class CTFBotError extends Error {
  constructor(message: string, name = 'CTFBotError') {
    super(message);

    this.name = name;

    if (Error.captureStackTrace) Error.captureStackTrace(this, CTFBotError);
  }
}
