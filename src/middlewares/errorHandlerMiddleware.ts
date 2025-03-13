import type { NextFunction, Request, Response } from 'express';

import { EHttpStatusCode } from '@/enums';
import { ResErrorModel } from '@/models';
import { logger } from '@/utils/logger';

class AppError extends Error {
  public statusCode: number;
  public errorCode?: number;

  constructor(message: string, statusCode: number, errorCode?: number) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

function errorHandlerMiddleware(err: AppError, req: Request, res: Response, _next: NextFunction) {
  void logger.error(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${
      req.headers.origin
    }, error: ${JSON.stringify(err)}`,
  );

  const status = err.statusCode ? err.statusCode : EHttpStatusCode.INTERNAL_SERVER_ERROR;
  const errMessage = err.message || 'Server Error';

  res.status(status).json(ResErrorModel(errMessage, err.errorCode));
}

export default errorHandlerMiddleware;
