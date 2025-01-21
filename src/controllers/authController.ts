import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';

import { EHttpStatusCode, EJwtExpirationErrorCode, EJwtToken, EUserRole } from '@/enums';
import { authentication, random } from '@/helpers';
import { type IResponseUserToken, type IRefreshTokenSuccessData } from '@/interfaces';
import { UserModel, ResSuccessModel, ResErrorModel, ResUserSuccessModel } from '@/models';
import { generateJwtPayload, handleResponseJwt, validateCredentials } from '@/utils';

const registerUser = async (req: Request, res: Response, next: NextFunction, role: EUserRole) => {
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
        password: authentication(salt, password)
      },
      role
    });

    await newUser.save();

    const { accessToken, refreshToken } = handleResponseJwt(newUser);

    res.status(EHttpStatusCode.CREATED).json(
      ResSuccessModel<IResponseUserToken>({
        tokens: {
          accessToken,
          refreshToken
        },
        user: ResUserSuccessModel(newUser)
      })
    );
  } catch (error) {
    next(error);
  }
};

const registerAdmin = (req: Request, res: Response, next: NextFunction) => {
  void registerUser(req, res, next, EUserRole.ADMIN);
};

const register = (req: Request, res: Response, next: NextFunction) => {
  void registerUser(req, res, next, EUserRole.USER);
};

const login = async (req: Request, res: Response, next: NextFunction) => {
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

    const { accessToken, refreshToken } = handleResponseJwt(user);

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<IResponseUserToken>({
        tokens: {
          accessToken,
          refreshToken
        },
        user: ResUserSuccessModel(user)
      })
    );
  } catch (error) {
    next(error);
  }
};

const refreshAccessToken = async (req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.body.refreshToken;

  jwt.verify(refreshToken, process.env.REFHRESTJWTSECRET, (err, user) => {
    if (err) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel(err.message, EJwtExpirationErrorCode.REFRESH_TOKEN_EXPIRED));
    }

    const newAccessToken = jwt.sign(generateJwtPayload(user), process.env.ACCESSJWTSECRET, {
      expiresIn: EJwtToken.ACCESS_TOKEN_EXPIRATION
    });

    res.status(EHttpStatusCode.OK).json(
      ResSuccessModel<IRefreshTokenSuccessData>({
        accessToken: newAccessToken
      })
    );
  });
};

const authController = {
  register,
  login,
  refreshAccessToken,
  registerAdmin
};

export default authController;
