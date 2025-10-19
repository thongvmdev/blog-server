import { authController } from '@/controllers';
import { verifyTokenMiddleware } from '@/middlewares';

import express from 'express';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshAccessToken);
router.post('/register-admin', authController.registerAdmin);
router.post('/logout', verifyTokenMiddleware, authController.logout);
router.post('/logout-all', verifyTokenMiddleware, authController.logoutAll);

export default router;
