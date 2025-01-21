import * as fs from 'fs';
import { promises as fsPromises } from 'fs';
import * as path from 'path';

import { format } from 'date-fns';
import { type Request, type Response, type NextFunction } from 'express';
import { v4 as uuid } from 'uuid';

const logEvents = async (message: string, logFileName: string): Promise<void> => {
  const dateTime = format(new Date(), 'yyyyMMdd\tHH:mm:ss');
  const logItem = `${dateTime}\t${uuid()}\t${message}\n`;

  try {
    if (!fs.existsSync(path.join(__dirname, '..', 'logs'))) {
      await fsPromises.mkdir(path.join(__dirname, '..', 'logs'));
    }
    await fsPromises.appendFile(path.join(__dirname, '..', 'logs', logFileName), logItem);
  } catch (err) {
    console.error(err);
  }
};

const logger = (req: Request, res: Response, next: NextFunction): void => {
  void logEvents(`${req.method}\t${req.url}\t${req.headers.origin}`, 'reqLog.log');
  console.log(`${req.method} ${req.path}`);
  next();
};

export { logEvents, logger };
