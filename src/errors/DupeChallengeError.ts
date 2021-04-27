export class DupeChallengeError extends Error {
  constructor() {
    super();
    this.message = 'cannot create a duplicate challenge in this ctf';
    this.name = 'DupeChallengeError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DupeChallengeError);
    }
  }
}
