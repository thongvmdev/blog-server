import { type Response, type NextFunction } from 'express';

import { EHttpStatusCode, EUserRole } from '@/enums';
import { type CustomJwtMiddlewareRequest } from '@/interfaces';
import { ResErrorModel } from '@/models/ResponseModel';

const checkAdminRoleMiddleware = (
  req: CustomJwtMiddlewareRequest,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;

  if (user?.role !== EUserRole.ADMIN) {
    return res.status(EHttpStatusCode.FORBIDDEN).json(ResErrorModel('Access denied'));
  }

  next();
};

export default checkAdminRoleMiddleware;
