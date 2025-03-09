import express from 'express';

import { uploadController } from '@/controllers';
import { multerMiddleware, verifyTokenMiddleware } from '@/middlewares';

const router = express.Router();

router.post(
  '/image',
  verifyTokenMiddleware,
  multerMiddleware.uploadImg.single('file'),
  uploadController.uploadImage
);

export default router;
