import { logger } from '../../log';

export default (timeout: number, limit: number, method: string, path: string) => {
  logger.warn(`${method} ${path} \n\t has been rate limited (${limit}) for the next ${timeout / 1000} seconds`);
};
