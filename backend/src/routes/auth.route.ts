import express from 'express';
import rateLimit from 'express-rate-limit';
import {
    register,
    login,
    logout,
    checkAuth,
    updateProfile,
    changePassword
} from "../controllers/auth.controller.js";
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// Rate limiting: 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: { success: false, message: 'Too many login/register attempts. Please try again later.' },
    standardHeaders: false,
    legacyHeaders: false,
});

router.post('/login', authLimiter, login);
router.post('/register', authLimiter, register);
router.post('/logout', logout);
router.get('/me', verifyToken, checkAuth)
router.put('/profile', verifyToken, updateProfile)
router.put('/change-password', verifyToken, changePassword)

// router.post('/verify-email', verifyEmail);
// router.post('/forgot-password', forgotPassword);
// router.post('/reset-password/:token', resetPassword);

export default router;