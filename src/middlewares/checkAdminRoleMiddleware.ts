import type { CustomJwtMiddlewareRequest } from '@/interfaces';

import type { NextFunction, Response } from 'express';
import { EHttpStatusCode, EUserRole } from '@/enums';
import { ResErrorModel } from '@/models/ResponseModel';

function checkAdminRoleMiddleware(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  const user = req.user;

  if (user?.role !== EUserRole.ADMIN) {
    return res.status(EHttpStatusCode.FORBIDDEN).json(ResErrorModel('Access denied'));
  }

  next();
}

export default checkAdminRoleMiddleware;
