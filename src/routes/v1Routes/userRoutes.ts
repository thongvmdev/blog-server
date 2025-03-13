import { userController } from '@/controllers';

import { multerMiddleware, verifyTokenGoogleProvider, verifyTokenMiddleware } from '@/middlewares';
import express from 'express';

const router = express.Router();

router.delete('/:userId', verifyTokenMiddleware, userController.deleteUser);
router.get('/me', verifyTokenMiddleware, userController.getUserInfo);
router.get('/check-user/:email', verifyTokenGoogleProvider, userController.checkUserExistence);
router.post('/oauth-user', verifyTokenGoogleProvider, userController.saveOAuthUser);
router.patch('/', verifyTokenMiddleware, userController.updateUser);
router.patch('/password', verifyTokenMiddleware, userController.updatePassword);
router.patch(
  '/profile-image',
  verifyTokenMiddleware,
  multerMiddleware.uploadImg.single('file'),
  userController.updateUserProfileImage,
);

export default router;
