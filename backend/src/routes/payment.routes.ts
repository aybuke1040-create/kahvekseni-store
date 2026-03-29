import { Router } from 'express';
import { initPayment, paymentCallback } from '../controllers/payment.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/init', authenticate, initPayment);
router.post('/callback', paymentCallback);

export default router;
