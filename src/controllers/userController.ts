import { type Request, type Response, type NextFunction } from 'express';
import { type TokenPayload } from 'google-auth-library';
import { isEmpty } from 'lodash';
import { nanoid } from 'nanoid';

import { hostnameImgUrlMap } from '@/constants';
import { EHttpStatusCode } from '@/enums';
import { authentication, random } from '@/helpers';
import {
  type IDeletedUserResponse,
  type IJwtUserPayload,
  type IResponseUserToken,
  type CustomJwtMiddlewareRequest,
  type IRequestWithUploadMedia,
  type IUserModelKeys
} from '@/interfaces';
import { ResErrorModel, ResSuccessModel, ResUserSuccessModel, UserModel } from '@/models';
import { s3Service } from '@/services';
import { getUrlInfo, handleResponseJwt, removeLeadingSlash } from '@/utils';

interface IRequestWithUser extends Request {
  user: IJwtUserPayload;
}

const deleteUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const deletedUser = await UserModel.findOneAndDelete({ _id: userId });

    if (deletedUser) {
      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<IDeletedUserResponse>({
          message: `Deleted User: ${deletedUser.email}`
        })
      );
    } else {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }
  } catch (error) {
    next(error);
  }
};

const getUserInfo = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req?.user?.id;
    const userData = await UserModel.findById(userId).select('-authentication');

    if (!userData) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }

    const userFields: IUserModelKeys[] = ['email', 'profilePictureUrl', 'bio', 'name', 'username'];
    return res.status(EHttpStatusCode.OK).json(ResUserSuccessModel(userData, userFields));
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req: IRequestWithUser, res: Response, next: NextFunction) => {
  try {
    const userId = req.user.id;
    const updateData = req.body;
    const username = updateData?.username;

    if (isEmpty(updateData)) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid update data.'));
    }

    if (username) {
      const existingUser = await UserModel.findOne({ username });
      if (existingUser && existingUser._id.toString() !== userId) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json(ResErrorModel('Username already exists'));
      }
    }

    const user = await UserModel.findByIdAndUpdate(userId, updateData, { new: true }).select(
      '-authentication'
    );

    return res.status(EHttpStatusCode.OK).json(ResUserSuccessModel(user));
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(EHttpStatusCode.BAD_REQUEST)
        .json(ResErrorModel('Missing current password or new password.'));
    }

    const user = await UserModel.findById(userId);

    if (!user) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found.'));
    }

    const currentHashedPassword = authentication(user?.authentication?.salt, currentPassword);

    if (user?.authentication?.password !== currentHashedPassword) {
      return res
        .status(EHttpStatusCode.UNAUTHORIZED)
        .json(ResErrorModel('Current password is incorrect.'));
    }

    const newSalt = random();
    const newHashedPassword = authentication(newSalt, newPassword);

    user.authentication = {
      salt: newSalt,
      password: newHashedPassword
    };

    await user.save();

    return res
      .status(EHttpStatusCode.OK)
      .json(ResSuccessModel<string>('Password updated successfully.'));
  } catch (error) {
    next(error);
  }
};

const updateUserProfileImage = async (
  req: IRequestWithUploadMedia,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = await UserModel.findById(req.user.id);
    const file = req.file;

    if (!user) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }

    if (!file) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('No file uploaded'));
    }

    const userProfileUrlObj = getUrlInfo(user.profilePictureUrl);
    const oldImgKey = userProfileUrlObj?.pathname;

    const s3Data = await s3Service.uploadToS3(file);
    user.profilePictureUrl = s3Data.url;

    if (hostnameImgUrlMap[userProfileUrlObj?.hostname] === 'AWS' && oldImgKey) {
      void s3Service.deleteFromS3(removeLeadingSlash(oldImgKey));
    }

    await user.save();

    return res
      .status(EHttpStatusCode.OK)
      .json(
        ResSuccessModel<{ newProfilePictureUrl: string }>({ newProfilePictureUrl: s3Data.url })
      );
  } catch (error) {
    next(error);
  }
};

const checkUserExistence = async (
  req: IRequestWithUploadMedia,
  res: Response,
  next: NextFunction
) => {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });

    if (user) {
      const { accessToken, refreshToken } = handleResponseJwt(user);

      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<IResponseUserToken>({
          tokens: {
            accessToken,
            refreshToken
          },
          user: ResUserSuccessModel(user),
          exists: true
        })
      );
    } else {
      return res
        .status(EHttpStatusCode.OK)
        .json(ResSuccessModel<{ exists: boolean }>({ exists: false }));
    }
  } catch (error) {
    next(error);
  }
};

const saveOAuthUser = async (
  req: CustomJwtMiddlewareRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, picture } = req.user as TokenPayload;

    const existingUser = await UserModel.findOne({ email });

    if (existingUser) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('User already exits'));
    }

    const emailPrefix = email.split('@')[0];
    const username = `${emailPrefix}_${nanoid(5)}`;

    const newUser = new UserModel({
      username,
      email,
      name: emailPrefix,
      profilePictureUrl: picture ?? null
    });

    await newUser.save();

    const { accessToken, refreshToken } = handleResponseJwt(newUser);

    res.status(EHttpStatusCode.OK).json(
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

const userController = {
  deleteUser,
  updateUser,
  getUserInfo,
  updatePassword,
  updateUserProfileImage,
  checkUserExistence,
  saveOAuthUser
};

export default userController;
