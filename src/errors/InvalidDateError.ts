export class InvalidDateError extends Error {
  constructor() {
    super();
    this.message = 'all team servers are full';
    this.name = 'InvalidDateError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, InvalidDateError);
    }
  }
}
