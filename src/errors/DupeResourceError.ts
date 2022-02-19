class DupeResourceError extends Error {
  constructor(resource: string, conflict: string) {
    super();
    this.message = `${resource} already exists with that ${conflict}`;
    this.name = 'DupeResourceError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, DupeResourceError);
    }
  }
}

export const createDupeCTFError = () => new DupeResourceError('CTF', 'guildSnowflake');
