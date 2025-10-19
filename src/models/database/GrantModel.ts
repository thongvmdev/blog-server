import type { IGrantModel } from '@/interfaces';

import mongoose from 'mongoose';

const GrantSchema = new mongoose.Schema<IGrantModel>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    consumedRefreshTokens: {
      type: [
        {
          hash: { type: String, required: true },
          issuedAt: { type: Date, required: true },
        },
      ],
      default: [],
    },
    isRevoked: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  { timestamps: true },
);

// Add TTL index to automatically delete inactive grants after 30 days of NO ACTIVITY
// MongoDB deletes grants where updatedAt is older than 30 days
// Active users keep refreshing → updatedAt keeps updating → Grant never expires
GrantSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 2592000 });

// Compound index for efficient queries on userId and revocation status
GrantSchema.index({ userId: 1, isRevoked: 1 });

export const GrantModel = mongoose.model<IGrantModel>('Grant', GrantSchema);
