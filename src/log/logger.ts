import winston from 'winston';

const logger = winston.createLogger({
  defaultMeta: { service: 'ctfbot' },
});

// default console logging for now
logger.add(
  new winston.transports.Console({
    format: winston.format.simple(),
  }),
);

export default logger;

// old logger, please disregard for now
// export default (...message: never[]) => {
//   // eslint-disable-next-line no-console
//   console.log(
//     '[\u001b[34mctfbot\u001b[0m]\u001b[33m',
//     new Date(),
//     '\u001b[0m-',
//     ...message.map((msg) => msg.toString().replace(/\*/g, '')),
//   );
// };
