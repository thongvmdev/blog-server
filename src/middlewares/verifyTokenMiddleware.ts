import type { CustomJwtMiddlewareRequest, IJwtUserPayload } from '@/interfaces';
import type { NextFunction, Response } from 'express';

import { envConfig } from '@/config/env.config';
import { EHttpStatusCode, EJwtExpirationErrorCode } from '@/enums';
import { ResErrorModel } from '@/models';
import jwt from 'jsonwebtoken';

function verifyTokenMiddleware(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(EHttpStatusCode.UNAUTHORIZED)
      .json(ResErrorModel('No token provided', EJwtExpirationErrorCode.NO_TOKEN_PROVIDED));
  }

  jwt.verify(token.split(' ')[1], envConfig.JWT_SECRET, (err, user: IJwtUserPayload) => {
    if (err) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(
          ResErrorModel(
            err?.message || 'Unauthorized',
            EJwtExpirationErrorCode.ACCESS_TOKEN_EXPIRED,
          ),
        );
    }

    req.user = user;
    next();
  });
}

export default verifyTokenMiddleware;
