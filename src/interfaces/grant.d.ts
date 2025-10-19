import type { HydratedDocument } from 'mongoose';

export interface IConsumedToken {
  hash: string;
  issuedAt: Date;
}

export interface IGrantModel extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  consumedRefreshTokens: IConsumedToken[];
  isRevoked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type IHydratedGrantModel = HydratedDocument<IGrantModel>;
