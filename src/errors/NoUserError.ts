export class NoUserError extends Error {
  constructor() {
    super();
    this.message = 'that user is not in this ctf';
    this.name = 'NoUserError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoUserError);
    }
  }
}
