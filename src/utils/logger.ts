import { createLogger, format, transports } from 'winston';
import 'winston-daily-rotate-file';

const logFormat = format.combine(
  format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  format.printf(({ level, message, timestamp }: any) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
  }),
);

const logger = createLogger({
  format: logFormat,
  transports: [
    new transports.Console(),
    new transports.DailyRotateFile({
      level: 'info',
      dirname: 'logs',
      filename: '%DATE%-request.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
    }),
    new transports.DailyRotateFile({
      dirname: 'logs',
      filename: '%DATE%-error.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    }),
  ],
});

export { logger };
