import { articleController } from '@/controllers';

import { verifyTokenMiddleware } from '@/middlewares';
import express from 'express';

const router = express.Router();

router.post('/', verifyTokenMiddleware, articleController.createArticle);
router.get('/', articleController.getArticles);
router.get('/search', articleController.searchArticles);
router.get('/published', articleController.getPublishedArticles); // for home page
router.get('/published/publishId/:publishId', articleController.getPublishedArticleByPublishId);
router.patch('/:articleId/like', verifyTokenMiddleware, articleController.incrementLikesCount);
router.patch('/:articleId/unlike', verifyTokenMiddleware, articleController.decrementLikesCount);
router.get('/:id', articleController.getArticleById);
router.get('/author/:authorId', articleController.getArticlesByAuthor);
router.patch('/:id', verifyTokenMiddleware, articleController.updateArticle);
router.delete('/:id', verifyTokenMiddleware, articleController.deleteArticle);

export default router;
