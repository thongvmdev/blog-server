import { Router } from 'express';

import tagController from '@/controllers/tagController';
import { checkAdminRoleMiddleware, verifyTokenMiddleware } from '@/middlewares';

const router = Router();

router.post('/', verifyTokenMiddleware, tagController.createTags);
router.post('/bulk', verifyTokenMiddleware, checkAdminRoleMiddleware, tagController.addTagsByAdmin);
router.get('/suggest', tagController.getSuggestedTags);
router.get('/', verifyTokenMiddleware, checkAdminRoleMiddleware, tagController.getTags);
router.get('/:id', tagController.getTagById);
router.patch(
  '/:id/moderate',
  verifyTokenMiddleware,
  checkAdminRoleMiddleware,
  tagController.updateTag
);
router.delete('/:id', verifyTokenMiddleware, checkAdminRoleMiddleware, tagController.deleteTag);

export default router;
