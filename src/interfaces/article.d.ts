import type { EContentType } from '@/enums';
import type { Document } from 'mongoose';

export interface IArticle extends Document {
  title: string;
  subTitle: string;
  slug: string | null;
  content: string;
  contentType: EContentType;
  coverImage: string;
  publishId: string | null;
  author: mongoose.Types.ObjectId;
  tags: mongoose.Types.ObjectId[];
  categories: mongoose.Types.ObjectId[];
  publishedAt: Date | null;
  likesCount: number;
  status: EArticleStatus;
  usageCount: number;
  engagementScore: number;
  lastUsed: Date | null;
  relevanceScore: number;
  likedBy: mongoose.Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
}

export type IArticleKeys = keyof IArticle;
