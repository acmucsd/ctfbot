export class NoRoomError extends Error {
  constructor() {
    super();
    this.message = 'all team servers are full';
    this.name = 'NoRoomError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NoRoomError);
    }
  }
}
