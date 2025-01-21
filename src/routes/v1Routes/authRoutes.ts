import express from 'express';

import { authController } from '@/controllers';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshAccessToken);
router.post('/register-admin', authController.registerAdmin);

export default router;
