import { Router } from 'express';
import {
  createOrder,
  getOrders,
  getOrder,
  completeOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/order.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  createOrderValidator,
  handleValidationErrors,
  orderIdParamValidator,
  updateOrderStatusValidator,
} from '../middlewares/validation.middleware';

const router = Router();

router.use(authenticate);
router.post('/', createOrderValidator, handleValidationErrors, createOrder);
router.get('/', getOrders);
router.get('/admin', requireAdmin, getAllOrdersAdmin);
router.patch('/:id/status', requireAdmin, orderIdParamValidator, updateOrderStatusValidator, handleValidationErrors, updateOrderStatusAdmin);
router.get('/:id', orderIdParamValidator, handleValidationErrors, getOrder);
router.post('/:id/complete', orderIdParamValidator, handleValidationErrors, completeOrder);

export default router;
