export class NoTeamUserError extends Error {
  constructor() {
    super();
    this.message = 'no team associated with that user';
    this.name = 'NoTeamUserError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoTeamUserError);
    }
  }
}
