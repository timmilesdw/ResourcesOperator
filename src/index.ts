import { createLogger, format, transports } from 'winston';
import ResourceOperator from './operator';

const logger = createLogger({
  format: format.json(),
  transports: [
    new transports.Console(),
  ],
});

const operator = new ResourceOperator(logger);

operator.start();

const exit = (reason: string) => {
  operator.stop();
  logger.info(`Exiting; Reason: ${reason}`);
  process.exit(0);
};

process.on('SIGTERM', () => exit('SIGTERM'))
  .on('SIGINT', () => exit('SIGINT'));
