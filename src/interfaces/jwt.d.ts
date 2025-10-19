import type { IUserModel } from '@/interfaces';

import type { Request } from 'express';

export interface IJwtUserPayload extends Pick<IUserModel, 'email' | 'role'> {
  id?: string;
  grantId?: string;
}

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
}

export interface CustomJwtMiddlewareRequest extends Request {
  user?: IJwtUserPayload | TokenPayload;
}
