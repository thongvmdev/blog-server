import { resumeController } from '@/controllers';

import { verifyTokenMiddleware } from '@/middlewares';
import express from 'express';

const router = express.Router();

router.post('/', verifyTokenMiddleware, resumeController.createResume);
router.get('/me', verifyTokenMiddleware, resumeController.getResume);
router.get('/:resumeId', resumeController.getResumeById);
router.patch('/', verifyTokenMiddleware, resumeController.updateResume);
router.delete('/', verifyTokenMiddleware, resumeController.deleteResume);

export default router;

