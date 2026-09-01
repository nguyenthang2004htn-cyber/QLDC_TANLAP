import { Router } from 'express';
import authController from '../controllers/auth.controller.js';

const router = Router();

router.post('/api/login', authController.login);
router.post('/api/register', authController.register);
router.post('/api/forgot-password/request', authController.requestOtp);
router.post('/api/forgot-password/verify', authController.verifyOtp);
router.post('/api/forgot-password/reset', authController.resetPassword);

router.get('/api/profile/:id', authController.getProfile);
router.put('/api/profile/:id', authController.updateProfile);

// API Admin - Quản lý tài khoản
router.get('/api/admin/users', authController.getAllUsers);
router.put('/api/admin/users/:id/role', authController.updateUserRole);
router.delete('/api/admin/users/:id', authController.deleteUser);

// API Admin - Tạo tài khoản mới
router.post('/api/admin/users', authController.createUserAdmin);

export default router;
