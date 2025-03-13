import { authController } from '@/controllers';

import express from 'express';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/token/refresh', authController.refreshAccessToken);
router.post('/register-admin', authController.registerAdmin);

export default router;
