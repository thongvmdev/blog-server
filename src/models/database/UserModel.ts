import type { IUserModel } from '@/interfaces';
import { EUserRole } from '@/enums';

import mongoose from 'mongoose';
import validator from 'validator';

const UserSchema = new mongoose.Schema<IUserModel>(
  {
    username: {
      type: String,
      minlength: 1,
      maxlength: 40,
      unique: true,
    },
    name: {
      type: String,
      minlength: 1,
      maxlength: 30,
    },
    bio: {
      type: String,
      maxlength: 200,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      validate: {
        validator: email => validator.isEmail(email),
        message: 'Invalid email format',
      },
    },
    profilePictureUrl: {
      type: String,
    },
    authentication: {
      password: { type: String },
      salt: { type: String },
    },
    role: {
      type: String,
      enum: [EUserRole.USER, EUserRole.ADMIN],
      default: EUserRole.USER,
    },
  },
  { timestamps: true },
);

export const UserModel = mongoose.model<IUserModel>('User', UserSchema);
