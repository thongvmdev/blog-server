import { type ObjectId } from 'mongodb';

export interface IJwtToken {
  accessToken: string;
  refreshToken: string;
}

export interface IResponseUserToken {
  user?: {
    id: ObjectId;
    email: string;
    profilePictureUrl?: string;
  };
  tokens: IJwtToken;
  exists?: boolean;
}

export interface IUserData {
  id: ObjectId;
  email?: string;
  username?: string;
  profilePictureUrl?: string;
  firstName?: string;
  lastName?: string;
}

export interface IRefreshTokenSuccessData {
  accessToken: string;
}

export interface IDeletedUserResponse {
  message: string;
}
