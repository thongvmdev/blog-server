import type { ITagKeys } from '@/interfaces';
import type { NextFunction, Request, Response } from 'express';

import { EHttpStatusCode } from '@/enums';
import { ResErrorModel, ResSuccessModel, ResSuccessModelWithPaging, TagModel } from '@/models';
import { convertToObjectId } from '@/utils';
import { isEmpty } from 'lodash';

/**
 * Updates the usage count of tags by a specified increment or decrement value.
 *
 * @param tagIds - An array of tag IDs to update.
 * @param increment - A boolean indicating whether to increment (true) or decrement (false) the usage count.
 * @returns A promise that resolves when the update operation is complete.
 */
export async function updateTagUsageCount(tagIds: string[], increment: boolean): Promise<void> {
  if (isEmpty(tagIds)) {
    return;
  }

  const updateValue = increment ? 1 : -1;

  await TagModel.aggregate([
    {
      $match: {
        _id: {
          $in: convertToObjectId(tagIds),
        },
      },
    },
    {
      $set: {
        usageCount: { $add: ['$usageCount', updateValue] },
        suggested: {
          $cond: {
            if: { $gte: [{ $add: ['$usageCount', updateValue] }, 10] },
            then: true,
            else: false,
          },
        },
      },
    },
    {
      $merge: {
        into: 'tags',
        whenMatched: 'merge',
        whenNotMatched: 'fail',
      },
    },
  ]);
}

const tagController = {
  async createTags(req: Request, res: Response, next: NextFunction) {
    try {
      const tagsData = req.body;

      if (!Array.isArray(tagsData)) {
        return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid tags data'));
      }

      const insertedTags = await TagModel.insertMany(tagsData);
      res.status(EHttpStatusCode.CREATED).json(ResSuccessModel(insertedTags));
    }
    catch (error) {
      next(error);
    }
  },

  async getTags(req: Request, res: Response, next: NextFunction) {
    try {
      const { page = 1, limit = 10, name } = req.query;
      const query = name ? { name: new RegExp(name as string, 'i') } : {};

      const tagsData = await TagModel.find(query)
        .skip((Number(page) - 1) * Number(limit))
        .limit(Number(limit));

      if (isEmpty(tagsData)) {
        return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Tags not found'));
      }

      const totalTags = await TagModel.countDocuments(query);

      res.status(EHttpStatusCode.OK).json(
        ResSuccessModelWithPaging(tagsData, {
          total: totalTags,
          pages: Math.ceil(totalTags / Number(limit)),
          page: Number(page),
          limit: Number(limit),
        }),
      );
    }
    catch (error) {
      next(error);
    }
  },

  async getSuggestedTags(_: Request, res: Response, next: NextFunction) {
    try {
      const selectFields: ITagKeys[] = ['name', 'description'];
      const tagsData = await TagModel.find({ suggested: true })
        .sort({ usageCount: -1 })
        .select(selectFields);

      res.status(EHttpStatusCode.OK).json(ResSuccessModel(tagsData));
    }
    catch (error) {
      next(error);
    }
  },

  async getTagById(req: Request, res: Response, next: NextFunction) {
    try {
      const tag = await TagModel.findById(req.params.id);

      if (!tag) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Tag not found'));
      }

      res.status(EHttpStatusCode.OK).json(ResSuccessModel(tag));
    }
    catch (error) {
      next(error);
    }
  },

  async updateTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const tag = await TagModel.findByIdAndUpdate(
        id,
        { ...req.body, moderated: true },
        { new: true },
      );
      if (!tag) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Tag not found'));
      }
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(tag));
    }
    catch (error) {
      next(error);
    }
  },

  async deleteTag(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const tag = await TagModel.findByIdAndDelete(id);
      if (!tag) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Tag not found'));
      }
      res.status(EHttpStatusCode.OK).json(ResSuccessModel('Tag deleted'));
    }
    catch (error) {
      next(error);
    }
  },

  async addTagsByAdmin(req: Request, res: Response, next: NextFunction) {
    try {
      const tagsData = req.body;

      if (!Array.isArray(tagsData)) {
        return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid tags data'));
      }

      const tags = tagsData.map(tag => ({
        ...tag,
        moderated: true,
        suggested: true,
      }));

      const insertedTags = await TagModel.insertMany(tags);
      res.status(EHttpStatusCode.CREATED).json(ResSuccessModel(insertedTags));
    }
    catch (error) {
      next(error);
    }
  },
};

export default tagController;
