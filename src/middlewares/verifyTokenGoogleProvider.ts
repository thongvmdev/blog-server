import type { CustomJwtMiddlewareRequest } from '@/interfaces';
import type { NextFunction, Response } from 'express';

import { envConfig } from '@/config/env.config';
import { EHttpStatusCode } from '@/enums';
import { ResErrorModel } from '@/models';
import { OAuth2Client } from 'google-auth-library';

const CLIENT_ID = envConfig.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);

async function verifyTokenGoogleProvider(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (!token) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('No token provided.'));
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,
    });

    const googleUser = ticket.getPayload();

    req.user = googleUser;
    next();
  }
  catch (error) {
    next(error);
  }
}

export default verifyTokenGoogleProvider;
