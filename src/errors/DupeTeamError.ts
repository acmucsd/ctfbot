export class DupeTeamError extends Error {
  constructor() {
    super();
    this.message = 'team already exists with that name';
    this.name = 'DupeTeamError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DupeTeamError);
    }
  }
}
