import { type Request } from 'express';

import { type IUserModel } from '@/interfaces';

export interface IJwtUserPayload extends Pick<IUserModel, 'email' | 'role'> {
  id?: string;
}

export interface CustomJwtMiddlewareRequest extends Request {
  user?: IJwtUserPayload | TokenPayload;
}
