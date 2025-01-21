import { type Request, type Response, type NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

import { logEvents } from './logger';

import { EHttpStatusCode } from '@/enums';
import { ResErrorModel } from '@/models';

interface ILimiter {
  inMinute?: number;
  max?: number;
}

const limiter = ({ inMinute = 60 * 1000, max = 100 }: ILimiter = {}) =>
  rateLimit({
    windowMs: inMinute,
    max,
    message: {
      message: 'Too many login attempts from this IP, please try again after a 60 second pause'
    },
    handler: (req: Request, res: Response, _next: NextFunction, options) => {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      logEvents(
        `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
        'errLog.log'
      );

      return res
        .status(EHttpStatusCode.TOO_MANY_REQUESTS)
        .json(ResErrorModel(options?.message?.message));
    },
    standardHeaders: true,
    legacyHeaders: false
  });

const limiterMiddleware = {
  limiter,
  defaultLimiter: limiter()
};

export default limiterMiddleware;
