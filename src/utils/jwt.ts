import type { IHydratedUserModel, IJwtToken, IJwtUserPayload } from '@/interfaces';

import { envConfig } from '@/config/env.config';
import { EJwtToken } from '@/enums';
import jwt from 'jsonwebtoken';

export function generateJwtPayload(params: IHydratedUserModel): IJwtUserPayload {
  return {
    email: params.email,
    id: params._id?.toString(),
    role: params.role,
  };
}

export function handleResponseJwt(user: IHydratedUserModel): IJwtToken {
  const payload = generateJwtPayload(user);

  const accessToken = jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: EJwtToken.ACCESS_TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign(payload, envConfig.JWT_SECRET, {
    expiresIn: EJwtToken.REFRESH_TOKEN_EXPIRATION,
  });

  const result = {
    accessToken,
    refreshToken,
  };

  return result;
}
