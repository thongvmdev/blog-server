import type { IUserModel } from '@/interfaces';

import type { Request } from 'express';

export interface IJwtUserPayload extends Pick<IUserModel, 'email' | 'role'> {
  id?: string;
}

export interface CustomJwtMiddlewareRequest extends Request {
  user?: IJwtUserPayload | TokenPayload;
}
