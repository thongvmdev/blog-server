import type { IHydratedUserModel, IJwtToken, IJwtUserPayload } from '@/interfaces';

import crypto from 'node:crypto';
import { envConfig } from '@/config/env.config';
import { EJwtToken } from '@/enums';
import { GrantModel } from '@/models';
import jwt from 'jsonwebtoken';

export function generateJwtPayload(params: IHydratedUserModel | IJwtUserPayload, grantId?: string): IJwtUserPayload {
  const basePayload = {
    email: 'email' in params ? params.email : '',
    id: '_id' in params ? params._id?.toString() : params.id,
    role: params.role,
  };

  if (grantId) {
    return { ...basePayload, grantId };
  }

  return basePayload;
}

export function handleResponseJwt(user: IHydratedUserModel | IJwtUserPayload, grantId?: string): IJwtToken {
  const payload = generateJwtPayload(user, grantId);

  // Use ACCESS secret for access tokens - cryptographically separate from refresh tokens
  const accessToken = jwt.sign(payload, envConfig.JWT_ACCESS_SECRET, {
    expiresIn: EJwtToken.ACCESS_TOKEN_EXPIRATION,
  });

  // Use REFRESH secret for refresh tokens - cannot be verified with access secret
  const refreshToken = jwt.sign(payload, envConfig.JWT_REFRESH_SECRET, {
    expiresIn: EJwtToken.REFRESH_TOKEN_EXPIRATION,
  });

  const result = {
    accessToken,
    refreshToken,
  };

  return result;
}

export async function handleResponseJwtWithGrant(user: IHydratedUserModel): Promise<IJwtToken & { grantId: string }> {
  // Create a new Grant record for this authentication session
  const grant = await GrantModel.create({
    userId: user._id,
    consumedRefreshTokens: [],
    isRevoked: false,
  });

  const grantId = grant._id.toString();

  // Generate tokens with embedded grantId
  const tokens = handleResponseJwt(user, grantId);

  return {
    ...tokens,
    grantId,
  };
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function revokeGrant(grantId: string): Promise<void> {
  await GrantModel.findByIdAndUpdate(grantId, { isRevoked: true });
}
