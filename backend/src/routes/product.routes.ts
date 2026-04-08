import { Router } from 'express';
import { getProducts, getProduct, getCategories, createProduct, updateProduct } from '../controllers/product.controller';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import {
  createProductValidator,
  handleValidationErrors,
  productIdParamValidator,
  updateProductValidator,
} from '../middlewares/validation.middleware';

const router = Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/:slug', getProduct);
router.post('/', authenticate, requireAdmin, createProductValidator, handleValidationErrors, createProduct);
router.put('/:id', authenticate, requireAdmin, productIdParamValidator, updateProductValidator, handleValidationErrors, updateProduct);

export default router;
