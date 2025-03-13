import type { ICategory } from '@/interfaces';
import type { NextFunction, Request, Response } from 'express';

import { EHttpStatusCode } from '@/enums';
import { CategoryModel, ResErrorModel, ResSuccessModel } from '@/models';
import { generateSlug } from '@/utils';
import { uniqBy } from 'lodash';

const categoryController = {
  async createCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = new CategoryModel(req.body);
      await category.save();
      res.status(EHttpStatusCode.CREATED).json(ResSuccessModel(category));
    }
    catch (error) {
      next(error);
    }
  },

  async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categories = await CategoryModel.find();
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(categories));
    }
    catch (error) {
      next(error);
    }
  },

  async getCategoryById(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Category not found'));
      }
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(category));
    }
    catch (error) {
      next(error);
    }
  },

  async updateCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryModel.findById(req.params.id);
      if (!category) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Category not found'));
      }
      Object.assign(category, req.body);
      await category.save();
      res.status(EHttpStatusCode.OK).json(ResSuccessModel(category));
    }
    catch (error) {
      next(error);
    }
  },

  async deleteCategory(req: Request, res: Response, next: NextFunction) {
    try {
      const category = await CategoryModel.findByIdAndDelete(req.params.id);
      if (!category) {
        return res.status(EHttpStatusCode.NOT_FOUND).json(ResErrorModel('Category not found'));
      }
      res
        .status(EHttpStatusCode.OK)
        .json(ResSuccessModel({ message: 'Category deleted successfully' }));
    }
    catch (error) {
      next(error);
    }
  },

  async addCategories(req: Request, res: Response, next: NextFunction) {
    try {
      const categoriesData = req.body;

      if (!Array.isArray(categoriesData)) {
        return res.status(EHttpStatusCode.BAD_REQUEST).json(ResErrorModel('Invalid categories'));
      }

      const categories = categoriesData.map((category: ICategory) => {
        category.slug = generateSlug(category.name);
        return category;
      });

      const insertedCategories = await CategoryModel.insertMany(uniqBy(categories, 'name'));
      res.status(EHttpStatusCode.CREATED).json(ResSuccessModel(insertedCategories));
    }
    catch (error) {
      next(error);
    }
  },
};

export default categoryController;
