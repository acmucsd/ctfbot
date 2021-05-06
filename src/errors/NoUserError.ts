export class NoUserError extends Error {
  constructor() {
    super();
    this.message = 'that user needs to accept Terms of Service first';
    this.name = 'NoUserError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoUserError);
    }
  }
}
