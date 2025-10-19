import type { CustomJwtMiddlewareRequest, IDeletedUserResponse, IJwtUserPayload, IRequestWithUploadMedia, IResponseUserToken, IUserModelKeys } from '@/interfaces';
import type { NextFunction, Request, Response } from 'express';

import type { TokenPayload } from 'google-auth-library';
import path from 'node:path';
import { EHttpStatusCode, ETypeUpload } from '@/enums';

import { authentication, random } from '@/helpers';
import { ResErrorModel, ResSuccessModel, ResUserSuccessModel, UserModel } from '@/models';
import {
  deleteFolder,
  downloadAndSaveImage,
  handleResponseJwtWithGrant,
  moveFileToUploadFolder,
  removeOldProfilePicture,
} from '@/utils';
import { isEmpty } from 'lodash';
import { nanoid } from 'nanoid';

interface IRequestWithUser extends Request {
  user: IJwtUserPayload;
}

async function deleteUser(req: Request, res: Response, next: NextFunction) {
  try {
    const { userId } = req.params;
    const deletedUser = await UserModel.findOneAndDelete({ _id: userId }, { returnDocument: 'before' });
    if (deletedUser) {
      const folderPath = path.join(__dirname, '../../uploads/users', userId);
      deleteFolder(folderPath);

      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<IDeletedUserResponse>({
          message: `Deleted User`,
        }),
      );
    }
    else {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }
  }
  catch (error) {
    next(error);
  }
}

async function getUserInfo(req: IRequestWithUser, res: Response, next: NextFunction) {
  try {
    const userId = req?.user?.id;
    const userData = await UserModel.findById(userId).select('-authentication');

    if (!userData) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }

    const userFields: IUserModelKeys[] = ['email', 'profilePictureUrl', 'bio', 'name', 'username'];
    return res.status(EHttpStatusCode.OK).json(ResUserSuccessModel(userData, userFields));
  }
  catch (error) {
    next(error);
  }
}

async function updateUser(req: IRequestWithUser, res: Response, next: NextFunction) {
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
      '-authentication',
    );

    return res.status(EHttpStatusCode.OK).json(ResUserSuccessModel(user));
  }
  catch (error) {
    next(error);
  }
}

async function updatePassword(req, res, next) {
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
      password: newHashedPassword,
    };

    await user.save();

    return res
      .status(EHttpStatusCode.OK)
      .json(ResSuccessModel<string>('Password updated successfully.'));
  }
  catch (error) {
    next(error);
  }
}

async function updateUserProfileImage(req: IRequestWithUploadMedia, res: Response, next: NextFunction) {
  try {
    const user = await UserModel.findById(req.user.id);
    const file = req.file;

    if (!user) {
      return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('User not found'));
    }

    if (!file) {
      return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('No file uploaded'));
    }

    removeOldProfilePicture(user.profilePictureUrl, req);

    const imageUrl = moveFileToUploadFolder(req, file.filename, ETypeUpload.USERS, user.id);
    user.profilePictureUrl = imageUrl;

    await user.save();

    return res
      .status(EHttpStatusCode.OK)
      .json(ResSuccessModel<{ newProfilePictureUrl: string }>({ newProfilePictureUrl: imageUrl }));
  }
  catch (error) {
    next(error);
  }
}

async function checkUserExistence(req: IRequestWithUploadMedia, res: Response, next: NextFunction) {
  try {
    const email = req.params.email;
    const user = await UserModel.findOne({ email });

    if (user) {
      const { accessToken, refreshToken, grantId } = await handleResponseJwtWithGrant(user);

      console.log('🔐 Grant created for OAuth user check:', { userId: user._id, grantId });

      return res.status(EHttpStatusCode.OK).json(
        ResSuccessModel<IResponseUserToken>({
          tokens: {
            accessToken,
            refreshToken,
          },
          user: ResUserSuccessModel(user),
          exists: true,
        }),
      );
    }
    else {
      return res
        .status(EHttpStatusCode.OK)
        .json(ResSuccessModel<{ exists: boolean }>({ exists: false }));
    }
  }
  catch (error) {
    next(error);
  }
}

async function saveOAuthUser(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
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
    });

    const savedAvatarPath = await downloadAndSaveImage(req, picture, newUser.id);

    if (savedAvatarPath) {
      newUser.profilePictureUrl = savedAvatarPath;
    }

    await newUser.save();

    const { accessToken, refreshToken, grantId } = await handleResponseJwtWithGrant(newUser);

    console.log('🔐 Grant created for new OAuth user:', { userId: newUser._id, grantId });

    res.status(EHttpStatusCode.OK).json(
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

const userController = {
  deleteUser,
  updateUser,
  getUserInfo,
  updatePassword,
  updateUserProfileImage,
  checkUserExistence,
  saveOAuthUser,
};

export default userController;
