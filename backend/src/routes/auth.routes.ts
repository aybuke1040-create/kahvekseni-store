import { Router } from 'express';
import { register, login, refreshToken, logout, getMe, updateProfile } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import {
  handleValidationErrors,
  loginValidator,
  refreshTokenValidator,
  registerValidator,
  updateProfileValidator,
} from '../middlewares/validation.middleware';

const router = Router();

router.post('/register', registerValidator, handleValidationErrors, register);
router.post('/login', loginValidator, handleValidationErrors, login);
router.post('/refresh', refreshTokenValidator, handleValidationErrors, refreshToken);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);
router.put('/profile', authenticate, updateProfileValidator, handleValidationErrors, updateProfile);

export default router;
