import express from 'express';

import commentController from '@/controllers/commentController';
import { verifyTokenMiddleware } from '@/middlewares';

const router = express.Router();

router.post('/', verifyTokenMiddleware, commentController.createComment);
router.get('/:articleId', commentController.getCommentsByArticle);
router.delete('/:id', verifyTokenMiddleware, commentController.deleteComment);

export default router;
