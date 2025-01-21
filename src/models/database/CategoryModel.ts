import mongoose, { Schema } from 'mongoose';

import { generateSlug } from '@/utils';

const CategorySchema: Schema = new Schema(
  {
    slug: { type: String, unique: true },
    name: { type: String, required: true },
    color: { type: String, default: null },
    thumbnail: { type: String, default: null }
  },
  { timestamps: true }
);

CategorySchema.pre('save', function (next) {
  if (this.isModified('name') || this.isNew) {
    this.slug = generateSlug(this.name);
  }
  next();
});

export const CategoryModel = mongoose.model('Category', CategorySchema);
