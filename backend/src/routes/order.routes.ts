import { Router } from 'express';
import { createOrder, getOrders, getOrder, completeOrder } from '../controllers/order.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createOrder);
router.get('/', getOrders);
router.get('/:id', getOrder);
router.post('/:id/complete', completeOrder);

export default router;
