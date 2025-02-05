import { type Request, type Response, type NextFunction } from 'express';

import { logger } from '@/common/utils/logger';
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
  void logger.error(
    `${err.name}: ${err.message}\t${req.method}\t${req.url}\t${
      req.headers.origin
    }, error: ${JSON.stringify(err)}`
  );

  const status = err.statusCode ? err.statusCode : EHttpStatusCode.INTERNAL_SERVER_ERROR;
  const errMessage = err.message || 'Server Error';

  res.status(status).json(ResErrorModel(errMessage, err.errorCode));
};

export default errorHandlerMiddleware;
