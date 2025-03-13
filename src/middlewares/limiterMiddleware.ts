import type { NextFunction, Request, Response } from 'express';
import { EHttpStatusCode } from '@/enums';

import { ResErrorModel } from '@/models';
import { logger } from '@/utils/logger';
import rateLimit from 'express-rate-limit';

interface ILimiter {
  inMinute?: number;
  max?: number;
}

function limiter({ inMinute = 60 * 1000, max = 100 }: ILimiter = {}) {
  return rateLimit({
    windowMs: inMinute,
    max,
    message: {
      message: 'Too many login attempts from this IP, please try again after a 60 second pause',
    },
    handler: (req: Request, res: Response, _next: NextFunction, options) => {
      void logger.error(
        `Too Many Requests: ${options.message.message}\t${req.method}\t${req.url}\t${req.headers.origin}`,
      );

      return res
        .status(EHttpStatusCode.TOO_MANY_REQUESTS)
        .json(ResErrorModel(options?.message?.message));
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

const limiterMiddleware = {
  limiter,
  defaultLimiter: limiter(),
};

export default limiterMiddleware;
