import { uploadController } from '@/controllers';

import { multerMiddleware, verifyTokenMiddleware } from '@/middlewares';
import express from 'express';

const router = express.Router();

router.post(
  '/image',
  verifyTokenMiddleware,
  multerMiddleware.uploadImg.single('file'),
  uploadController.uploadImage,
);

export default router;
