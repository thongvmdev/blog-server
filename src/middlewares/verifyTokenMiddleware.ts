import { type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { EHttpStatusCode, EJwtExpirationErrorCode } from '@/enums';
import { type CustomJwtMiddlewareRequest, type IJwtUserPayload } from '@/interfaces';
import { ResErrorModel } from '@/models';

const verifyTokenMiddleware = (
  req: CustomJwtMiddlewareRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization;

  if (!token) {
    return res
      .status(EHttpStatusCode.UNAUTHORIZED)
      .json(ResErrorModel('No token provided', EJwtExpirationErrorCode.NO_TOKEN_PROVIDED));
  }

  jwt.verify(token.split(' ')[1], process.env.ACCESSJWTSECRET, (err, user: IJwtUserPayload) => {
    if (err) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(
          ResErrorModel(
            err?.message || 'Unauthorized',
            EJwtExpirationErrorCode.ACCESS_TOKEN_EXPIRED
          )
        );
    }

    req.user = user;
    next();
  });
};

export default verifyTokenMiddleware;
