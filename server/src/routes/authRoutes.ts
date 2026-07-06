import { Router } from 'express';
import {
  registerUser,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  verifyEmail,
  googleLogin,
} from '../controllers/authController';
import { protect } from '../middlewares/auth';

const router = Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/google-login', googleLogin);
router.put('/verify-email/:token', verifyEmail);
router.post('/logout', protect, logoutUser);
router.get('/me', protect, getCurrentUser);
router.post('/forgot-password', forgotPassword);
router.put('/reset-password/:resetToken', resetPassword);

export default router;
