import path from 'path';

import dayjs from 'dayjs';
import { type NextFunction, type Request, type Response } from 'express';
import { difference, isEmpty, pick } from 'lodash';

import { updateTagUsageCount } from './tagController';

import { EArticleStatus, EHttpStatusCode } from '@/enums';
import { type IArticle, type CustomJwtMiddlewareRequest } from '@/interfaces';
import { ArticleModel, ResSuccessModel, ResErrorModel, ResSuccessModelWithPaging } from '@/models';
import { deleteFolder } from '@/utils';

/**
 * Calculates the relevance score for a given item based on its usage count, engagement score, and recency of use.
 *
 * @param item - An object representing the item, which should include the following properties:
 *   - `usageCount`: The number of times the item has been used.
 *   - `engagementScore`: A score representing the engagement level with the item.
 *   - `lastUsed`: A date string representing the last time the item was used.
 * @returns The calculated relevance score as a number.
 */
export const calculateRelevanceScore = (item: Record<string, any>): number => {
  const usageScore = item.usageCount * 0.5;
  const engagementScore = item.engagementScore * 0.3;
  const daysSinceLastUsed = dayjs().diff(dayjs(item.lastUsed), 'day');
  const daysInMonth = 30;
  const recencyScore = Math.max(0, daysInMonth - daysSinceLastUsed) * 0.2;

  return usageScore + engagementScore + recencyScore;
};

export function updateArticleMetrics(article: IArticle): void {
  if (isEmpty(article)) return;

  article.usageCount += 1;
  article.engagementScore += 1;
  article.lastUsed = new Date();
  article.relevanceScore = calculateRelevanceScore(article);
}

const omitAuthorFields = '-authentication -createdAt -updatedAt';

const articleController = {
  async updateLikesCount(
    req: CustomJwtMiddlewareRequest,
    res: Response,
    next: NextFunction,
    increment: boolean
  ) {
    const { articleId } = req.params;
    const userId = req.user?.id;

    try {
      const article = await ArticleModel.findOne({
        _id: articleId,
        status: EArticleStatus.PUBLISHED
      });

      if (!article) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json(ResErrorModel('Article not found or not published'));
      }

      const hasLiked = article.likedBy.includes(userId);

      if (increment && hasLiked) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json(ResErrorModel('User has already liked this article'));
      }

      if (!increment && !hasLiked) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json(ResErrorModel('User has not liked this article'));
      }

      article.likesCount += increment ? 1 : -1;
      if (increment) {
        article.likedBy.push(userId);
        updateArticleMetrics(article);
      } else {
        article.likedBy = article.likedBy.filter((id) => {
          return id?.toString() !== userId;
        });
      }

      await article.save();
      const selectFields: Array<keyof IArticle> = ['likesCount', 'likedBy'];
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(pick(article, selectFields)));
    } catch (error) {
      next(error);
    }
  },

  async createArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const articlePayload = req.body as IArticle;

      const tags = req.body.tags || [];
      const maxTags = 4;

      if (tags.length > maxTags) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json(ResErrorModel('A article can have at most 4 tags.'));
      }

      const article = new ArticleModel(articlePayload);
      await article.save();
      await article.populate('author', omitAuthorFields);
      await article.populate('categories');

      void updateTagUsageCount(tags, true);
      res.status(EHttpStatusCode.CREATED).json(ResSuccessModel(article));
    } catch (error) {
      next(error);
    }
  },

  async getArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const query = status ? { status } : {};

      const articles = await ArticleModel.find(query)
        .populate('author', omitAuthorFields)
        .populate('categories')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const totalArticles = await ArticleModel.countDocuments(query);

      res.status(EHttpStatusCode.OK).json(
        ResSuccessModelWithPaging(articles, {
          total: totalArticles,
          pages: Math.ceil(totalArticles / Number(limit)),
          page: Number(page),
          limit: Number(limit)
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async getPublishedArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const query = { status: EArticleStatus.PUBLISHED };

      const articles = await ArticleModel.find(query)
        .populate('author', omitAuthorFields)
        .populate('categories')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const totalArticles = await ArticleModel.countDocuments(query);

      res.status(EHttpStatusCode.OK).json(
        ResSuccessModelWithPaging(articles, {
          total: totalArticles,
          pages: Math.ceil(totalArticles / Number(limit)),
          page: Number(page),
          limit: Number(limit)
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async getArticlesByAuthor(req: Request, res: Response, next: NextFunction) {
    try {
      const { status, page = 1, limit = 10, title } = req.query;
      const query: Record<string, any> = {
        author: req.params.authorId,
        ...(status && { status })
      };

      if (title) {
        query.title = { $regex: title, $options: 'i' };
      }

      const articles = await ArticleModel.find(query)
        .populate('author', omitAuthorFields)
        .populate('categories')
        .sort({ createdAt: -1 })
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      const totalArticles = await ArticleModel.countDocuments(query);

      res.status(EHttpStatusCode.OK).json(
        ResSuccessModelWithPaging(articles, {
          total: totalArticles,
          pages: Math.ceil(totalArticles / Number(limit)),
          page: Number(page),
          limit: Number(limit)
        })
      );
    } catch (error) {
      next(error);
    }
  },

  async getArticleById(req: Request, res: Response, next: NextFunction) {
    try {
      const article = await ArticleModel.findById(req.params.id)
        .populate('author', omitAuthorFields)
        .populate('categories', 'name slug thumbnail')
        .populate('tags', 'name description');

      if (!article) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Article not found'));
      }
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(article));
    } catch (error) {
      next(error);
    }
  },

  async getPublishedArticleByPublishId(req: Request, res: Response, next: NextFunction) {
    try {
      const { publishId } = req.params;
      const article = await ArticleModel.findOne({
        publishId,
        status: EArticleStatus.PUBLISHED
      })
        .populate('author', omitAuthorFields)
        .populate('categories', 'slug name color thumbnail')
        .populate('tags', 'name description');

      updateArticleMetrics(article);
      await article.save();

      res.status(EHttpStatusCode.OK).json(ResSuccessModel(article ?? null));
    } catch (error) {
      next(error);
    }
  },

  async updateArticle(req: Request, res: Response, next: NextFunction) {
    try {
      const updateArticle = req.body as IArticle;
      const article = await ArticleModel.findById(req.params.id);
      if (!article) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Article not found'));
      }

      const originTags = article?.tags.map((tag) => {
        return typeof tag === 'object' ? tag?.toString() : tag; // case ObjectId
      });
      const updateTags = updateArticle?.tags;

      const tagsToRemove = difference(originTags, updateTags);
      const tagsToAdd = difference(updateTags, originTags);

      Object.assign(article, updateArticle);
      await article.save();
      await article.populate('author', omitAuthorFields);
      await article.populate('categories');

      void updateTagUsageCount(tagsToRemove, false);
      void updateTagUsageCount(tagsToAdd, true);

      res.status(EHttpStatusCode.OK).json(ResSuccessModel(article));
    } catch (error) {
      next(error);
    }
  },

  async deleteArticle(req: CustomJwtMiddlewareRequest, res: Response, next: NextFunction) {
    try {
      const userId = req.user?.id;
      const articleId = req.params.id;

      const article = await ArticleModel.findOneAndDelete({
        _id: articleId,
        author: userId
      });

      if (!article) {
        return res
          .status(EHttpStatusCode.NOT_FOUND)
          .json(
            ResErrorModel('Article not found or you do not have permission to delete this article')
          );
      }

      const folderPath = path.join(__dirname, '../../uploads/articles', articleId);
      deleteFolder(folderPath);

      void updateTagUsageCount(article.tags, false);

      res
        .status(EHttpStatusCode.OK)
        .json(ResSuccessModel({ message: 'Article deleted successfully' }));
    } catch (error) {
      next(error);
    }
  },

  async searchArticles(req: Request, res: Response, next: NextFunction) {
    try {
      const { searchText, status } = req.query;
      if (!searchText) {
        return res
          .status(EHttpStatusCode.BAD_REQUEST)
          .json(ResErrorModel('Query parameter is required'));
      }

      const query = {
        $text: { $search: searchText as string },
        ...(status && { status })
      };

      const articles = await ArticleModel.find(query)
        .populate('author', omitAuthorFields)
        .populate('categories');

      res.status(EHttpStatusCode.OK).json(ResSuccessModel(articles));
    } catch (error) {
      next(error);
    }
  },

  incrementLikesCount(req: Request, res: Response, next: NextFunction) {
    const increment = true;
    void articleController.updateLikesCount(req, res, next, increment);
  },

  decrementLikesCount(req: Request, res: Response, next: NextFunction) {
    const increment = false;
    void articleController.updateLikesCount(req, res, next, increment);
  }
};

export default articleController;
