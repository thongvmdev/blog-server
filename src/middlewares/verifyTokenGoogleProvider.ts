import { type Response, type NextFunction } from 'express';
import { OAuth2Client } from 'google-auth-library';

import { EHttpStatusCode } from '@/enums';
import { type CustomJwtMiddlewareRequest } from '@/interfaces';
import { ResErrorModel } from '@/models';

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const client = new OAuth2Client(CLIENT_ID);

const verifyTokenGoogleProvider = async (
  req: CustomJwtMiddlewareRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authorization = req.headers.authorization;
    const token = authorization?.split(' ')[1];

    if (!token) {
      return res.status(EHttpStatusCode.UNAUTHORIZED).json(ResErrorModel('No token provided.'));
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID
    });

    const googleUser = ticket.getPayload();

    req.user = googleUser;
    next();
  } catch (error) {
    next(error);
  }
};

export default verifyTokenGoogleProvider;
