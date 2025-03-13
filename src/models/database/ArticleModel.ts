import type { IArticle } from '@/interfaces';
import { EArticleStatus } from '@/enums';
import mongoose, { Schema } from 'mongoose';

import { customAlphabet } from 'nanoid';
import slugify from 'slugify';

const nanoid = customAlphabet('1234567890abcdef');

const ArticleSchema: Schema = new Schema<IArticle>(
  {
    title: { type: String, default: '' },
    subTitle: { type: String, default: '' },
    slug: { type: String, default: null },
    content: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    publishId: { type: String, default: null, unique: true },
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    tags: [{ type: Schema.Types.ObjectId, ref: 'Tag', default: [] }],
    categories: [{ type: Schema.Types.ObjectId, ref: 'Category', default: [] }],
    publishedAt: { type: Date, default: null },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User', default: [] }],
    status: {
      type: String,
      enum: [EArticleStatus.DRAFT, EArticleStatus.PUBLISHED],
      default: EArticleStatus.DRAFT,
    },
    usageCount: { type: Number, default: 0 },
    engagementScore: { type: Number, default: 0 },
    lastUsed: { type: Date, default: null },
    relevanceScore: { type: Number, default: 0 },
  },
  { timestamps: true },
);

ArticleSchema.pre('save', async function (next) {
  if (this.isNew && !this.publishId) {
    this.publishId = nanoid(12);
  }

  if (this.isModified('status') && this.status === EArticleStatus.PUBLISHED) {
    this.publishedAt = new Date();
    if (!this.slug) {
      const baseSlug = slugify(this.title, { lower: true });
      this.slug = `${baseSlug}-${this.publishId}`;
    }
  }

  next();
});

ArticleSchema.index({
  title: 'text',
  slug: 'text',
  content: 'text',
  tags: 'text',
  categories: 'text',
  username: 'text',
});

export const ArticleModel = mongoose.model<IArticle>('Article', ArticleSchema);
