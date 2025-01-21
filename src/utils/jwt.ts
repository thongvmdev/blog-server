import jwt from 'jsonwebtoken';

import { EJwtToken } from '@/enums';
import { type IJwtToken, type IJwtUserPayload, type IHydratedUserModel } from '@/interfaces';

export const generateJwtPayload = (params: IHydratedUserModel): IJwtUserPayload => ({
  email: params.email,
  id: params._id?.toString(),
  role: params.role
});

export const handleResponseJwt = (user: IHydratedUserModel): IJwtToken => {
  const payload = generateJwtPayload(user);

  const accessToken = jwt.sign(payload, process.env.ACCESSJWTSECRET, {
    expiresIn: EJwtToken.ACCESS_TOKEN_EXPIRATION
  });

  const refreshToken = jwt.sign(payload, process.env.REFHRESTJWTSECRET, {
    expiresIn: EJwtToken.REFRESH_TOKEN_EXPIRATION
  });

  const result = {
    accessToken,
    refreshToken
  };

  return result;
};
