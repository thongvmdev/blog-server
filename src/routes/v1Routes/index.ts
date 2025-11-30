import { limiterMiddleware } from '@/middlewares';

import express from 'express';
import articleRoutes from './articleRoutes';
import authRoutes from './authRoutes';
import categoryRoutes from './categoryRoutes';
import commentRoutes from './commentRoutes';
import resumeRoutes from './resumeRoutes';
import tagRoutes from './tagRoutes';
import uploadRoutes from './uploadRoutes';

import userRoutes from './userRoutes';

const router = express.Router();

router.use('/auth', limiterMiddleware.defaultLimiter, authRoutes);
router.use('/user', userRoutes);
router.use('/articles', articleRoutes);
router.use('/comments', commentRoutes);
router.use('/upload', uploadRoutes);
router.use('/categories', categoryRoutes);
router.use('/tags', tagRoutes);
router.use('/resumes', resumeRoutes);

export default router;
