import express from 'express';

import { userController } from '@/controllers';
import { multerMiddleware, verifyTokenGoogleProvider, verifyTokenMiddleware } from '@/middlewares';

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
  multerMiddleware.profileImageUpload.single('file'),
  userController.updateUserProfileImage
);

export default router;
