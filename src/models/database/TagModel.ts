import mongoose, { Schema } from 'mongoose';

const TagSchema: Schema = new Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    suggested: { type: Boolean, default: false },
    moderated: { type: Boolean, default: false },
    usageCount: { type: Number, default: 0 },
  },
  { timestamps: true },
);

export const TagModel = mongoose.model('Tag', TagSchema);
