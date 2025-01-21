import { Router } from 'express';

import { categoryController } from '@/controllers';
import { verifyTokenMiddleware } from '@/middlewares';

const router = Router();

router.post('/', verifyTokenMiddleware, categoryController.createCategory);
router.post('/bulk', verifyTokenMiddleware, categoryController.addCategories);
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);
router.put('/:id', verifyTokenMiddleware, categoryController.updateCategory);
router.delete('/:id', verifyTokenMiddleware, categoryController.deleteCategory);

export default router;
