import { Router } from 'express';
import { initPayment, paymentCallback } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { handleValidationErrors, initPaymentValidator } from '../middlewares/validation.middleware';

const router = Router();

router.post('/init', authenticate, initPaymentValidator, handleValidationErrors, initPayment);
router.post('/callback', paymentCallback);

export default router;
