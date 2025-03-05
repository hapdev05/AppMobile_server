import express from 'express';
import authController from '../../controllers/auth/authController.js';
import { checkAdmin } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Auth routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Admin routes
router.get('/users', checkAdmin, authController.getAllUsers);
router.put('/user/role', checkAdmin, authController.updateUserRole);

export default router;