export class UnknownChallengeError extends Error {
  constructor() {
    super();
    this.message = 'could not determine challenge, try providing challenge_channel parameter';
    this.name = 'UnknownChallengeError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, UnknownChallengeError);
    }
  }
}
