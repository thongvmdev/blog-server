import { type HydratedDocument } from 'mongoose';

export interface IUserModel extends mongoose.Document {
  username: string;
  name: string;
  bio?: string;
  email: string;
  profilePictureUrl?: string;
  authentication: {
    password: string;
    salt: string;
  };
  role: EUserRole;
}

export type IHydratedUserModel = HydratedDocument<IUserModel>;

export type IUserModelKeys = keyof IUserModel;
