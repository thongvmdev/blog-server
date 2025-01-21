import { type Request, type Response, type NextFunction } from 'express';

import { logEvents } from './logger';

import { EHttpStatusCode } from '@/enums';
import { ResErrorModel } from '@/models';

class AppError extends Error {
  public statusCode: number;
  public errorCode?: number;

  constructor(message: string, statusCode: number, errorCode?: number) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

const errorHandlerMiddleware = (err: AppError, req: Request, res: Response, next: NextFunction) => {
  void logEvents(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
    'errLog.log'
  );

  const status = err.statusCode ? err.statusCode : EHttpStatusCode.INTERNAL_SERVER_ERROR;
  const errMessage = err.message || 'Server Error';

  res.status(status).json(ResErrorModel(errMessage, err.errorCode));
};

export default errorHandlerMiddleware;
