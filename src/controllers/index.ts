import articleController from './articleController';
import authController from './authController';
import categoryController from './categoryController';
import commentController from './commentController';
import tagController, { updateTagUsageCount } from './tagController';
import uploadController from './uploadController';
import userController from './userController';

export {
  authController,
  userController,
  articleController,
  commentController,
  uploadController,
  categoryController,
  tagController,
  updateTagUsageCount
};
