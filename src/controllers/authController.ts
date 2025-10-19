import type { CustomJwtMiddlewareRequest, IJwtUserPayload, IRefreshTokenSuccessData, IResponseUserToken } from '@/interfaces';
import type { NextFunction, Request, Response } from 'express';
import { envConfig } from '@/config/env.config';

import { EHttpStatusCode, EJwtExpirationErrorCode, EJwtToken, EUserRole } from '@/enums';
import { authentication, random } from '@/helpers';
import { GrantModel, ResErrorModel, ResSuccessModel, ResUserSuccessModel, UserModel } from '@/models';
import { generateJwtPayload, handleResponseJwt, handleResponseJwtWithGrant, hashToken, revokeGrant, validateCredentials } from '@/utils';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

async function registerUser(req: Request, res: Response, next: NextFunction, role: EUserRole) {
  try {
    const { email, password } = req.body;

    const isValidCredentials = validateCredentials(email, password);

    if (!isValidCredentials) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Email and password are required.'));
    }

    const existingUser = await UserModel.findOne({ email });
    if (existingUser) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('User already exists'));
    }

    const emailPrefix = email.split('@')[0];
    const username = `${emailPrefix}_${nanoid(5)}`;

    const salt = random();
    const newUser = new UserModel({
      email,
      username,
      name: emailPrefix,
      authentication: {
        salt,
        password: authentication(salt, password),
      },
      role,
    });

    await newUser.save();

    const { accessToken, refreshToken, grantId } = await handleResponseJwtWithGrant(newUser);

    console.log('🔐 Grant created for new user:', { userId: newUser._id, grantId });

    res.status(EHttpStatusCode.CREATED).json(
      ResSuccessModel<IResponseUserToken>({
        tokens: {
          accessToken,
          refreshToken,
        },
        user: ResUserSuccessModel(newUser),
      }),
    );
  }
  catch (error) {
    next(error);
  }
}

function registerAdmin(req: Request, res: Response, next: NextFunction) {
  void registerUser(req, res, next, EUserRole.ADMIN);
}

function register(req: Request, res: Response, next: NextFunction) {
  void registerUser(req, res, next, EUserRole.USER);
}

async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const isValidCredentials = validateCredentials(email, password);

    if (!isValidCredentials) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Email and password are required.'));
    }

    const user = await UserModel.findOne({ email });

    if (!user) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Invalid credentials. User not found.'));
    }

    const expectedHash = authentication(user.authentication.salt, password);

    if (user.authentication.password !== expectedHash) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Invalid credentials. Incorrect password.'));
    }

    const { accessToken, refreshToken, grantId } = await handleResponseJwtWithGrant(user);

    console.log('🔐 Grant created for login:', { userId: user._id, grantId });

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<IResponseUserToken>({
        tokens: {
          accessToken,
          refreshToken,
        },
        user: ResUserSuccessModel(user),
      }),
    );
  }
  catch (error) {
    next(error);
  }
}

async function refreshAccessToken(req: Request, res: Response, next: NextFunction) {
  try {
    const refreshToken = req.body.refreshToken;

    if (!refreshToken) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel('Refresh token is required', EJwtExpirationErrorCode.NO_TOKEN_PROVIDED));
    }

    // Verify using REFRESH secret only - access tokens will automatically fail verification
    // This provides cryptographic separation between token types
    const decoded = jwt.verify(refreshToken, envConfig.JWT_REFRESH_SECRET) as IJwtUserPayload;

    if (!decoded.grantId) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel('Invalid token: missing grant ID', EJwtExpirationErrorCode.REFRESH_TOKEN_EXPIRED));
    }

    // Check if Grant exists and is not revoked
    const grant = await GrantModel.findById(decoded.grantId);

    if (!grant) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel('Grant not found', EJwtExpirationErrorCode.REFRESH_TOKEN_EXPIRED));
    }

    if (grant.isRevoked) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel('Grant has been revoked due to security breach Or User Logged out', EJwtExpirationErrorCode.GRANT_REVOKED));
    }

    // Hash the current refresh token and check if it's already been consumed
    const tokenHash = hashToken(refreshToken);

    // Check if token was already consumed (with new time-based structure)
    const isConsumed = grant.consumedRefreshTokens.some(token => token.hash === tokenHash);

    if (isConsumed) {
      // TOKEN REUSE DETECTED - This is a security breach!
      console.error('🚨 SECURITY BREACH: Refresh token reuse detected!', {
        grantId: decoded.grantId,
        userId: decoded.id,
        tokenHash: `${tokenHash.substring(0, 16)}...`, // Log partial hash for debugging
      });

      // Revoke the entire grant to protect the user
      await revokeGrant(decoded.grantId);

      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(
          ResErrorModel(
            'Token reuse detected. All tokens have been revoked. Please log in again.',
            EJwtExpirationErrorCode.TOKEN_REUSE_DETECTED,
          ),
        );
    }

    // Token is valid - mark as consumed with issued timestamp from JWT
    grant.consumedRefreshTokens.push({
      hash: tokenHash,
      issuedAt: new Date((decoded as any).iat * 1000), // JWT iat is in seconds, convert to milliseconds
    });

    // Remove tokens older than refresh token lifetime (30 days) based on when they were ISSUED
    // This ensures tokens are kept for exactly their lifetime from issuance, not consumption time
    const refreshTokenLifetimeMs = EJwtToken.REFRESH_TOKEN_EXPIRATION * 1000;
    const cutoffDate = new Date(Date.now() - refreshTokenLifetimeMs);

    grant.consumedRefreshTokens = grant.consumedRefreshTokens.filter(
      token => token.issuedAt > cutoffDate,
    );

    console.log('🔄 Token rotated successfully:', {
      grantId: decoded.grantId,
      userId: decoded.id,
      consumedTokensCount: grant.consumedRefreshTokens.length,
      oldestTokenAge: grant.consumedRefreshTokens.length > 0
        ? Math.floor((Date.now() - grant.consumedRefreshTokens[0].issuedAt.getTime()) / 1000 / 60 / 60 / 24)
        : 0,
    });

    await grant.save();

    const { accessToken: newAccessToken, refreshToken: newRefreshToken } = handleResponseJwt(decoded, decoded.grantId);

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<IRefreshTokenSuccessData>({
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      }),
    );
  }
  catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel(error.message, EJwtExpirationErrorCode.REFRESH_TOKEN_EXPIRED));
    }
    next(error);
  }
}

async function logout(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user as IJwtUserPayload;

    if (!user?.grantId) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Invalid token: missing grant ID'));
    }

    // Find the grant
    const grant = await GrantModel.findById(user.grantId);

    if (!grant) {
      // Grant doesn't exist or already deleted
      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<{ message: string }>({
          message: 'Logged out successfully',
        }),
      );
    }

    if (grant.isRevoked) {
      // Already revoked
      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<{ message: string }>({
          message: 'Logged out successfully',
        }),
      );
    }

    // Revoke the grant - all tokens with this grantId become invalid
    await revokeGrant(user.grantId);

    console.log('👋 User logged out:', {
      userId: user.id,
      grantId: user.grantId,
    });

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<{ message: string }>({
        message: 'Logged out successfully',
      }),
    );
  }
  catch (error) {
    next(error);
  }
}

async function logoutAll(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const user = req.user as IJwtUserPayload;

    if (!user?.id) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Invalid token: missing user ID'));
    }

    // Revoke ALL active grants for this user
    const result = await GrantModel.updateMany(
      { userId: user.id, isRevoked: false },
      { $set: { isRevoked: true } },
    );

    console.log('🚪 User logged out from all devices:', {
      userId: user.id,
      revokedSessions: result.modifiedCount,
    });

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<{ message: string; revokedSessions: number }>({
        message: 'Logged out from all devices successfully',
        revokedSessions: result.modifiedCount,
      }),
    );
  }
  catch (error) {
    next(error);
  }
}

const authController = {
  register,
  login,
  refreshAccessToken,
  registerAdmin,
  logout,
  logoutAll,
};

export default authController;
