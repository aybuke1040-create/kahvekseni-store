import { NextFunction, Request, Response } from 'express';
import { body, param, validationResult } from 'express-validator';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Geçersiz istek verisi',
      errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg })),
    });
    return;
  }
  next();
};

export const registerValidator = [
  body('email').isEmail().withMessage('Geçerli e-posta giriniz').normalizeEmail(),
  body('password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('Şifre en az 8 karakter olmalıdır'),
  body('firstName').isString().trim().notEmpty().withMessage('Ad zorunludur'),
  body('lastName').isString().trim().notEmpty().withMessage('Soyad zorunludur'),
  body('phone').optional().isString().trim(),
  body('role').optional().isIn(['RETAIL', 'WHOLESALE']).withMessage('Rol geçersiz'),
];

export const loginValidator = [
  body('email').isEmail().withMessage('Geçerli e-posta giriniz').normalizeEmail(),
  body('password').isString().notEmpty().withMessage('Şifre zorunludur'),
];

export const refreshTokenValidator = [
  body('refreshToken').isString().notEmpty().withMessage('Refresh token zorunludur'),
];

export const updateProfileValidator = [
  body('firstName').optional().isString().trim().notEmpty(),
  body('lastName').optional().isString().trim().notEmpty(),
  body('phone').optional().isString().trim(),
  body('address').optional().isString().trim(),
  body('companyName').optional().isString().trim(),
  body('taxNumber').optional().isString().trim(),
];

export const createOrderValidator = [
  body('items').isArray({ min: 1 }).withMessage('Sepet en az bir ürün içermelidir'),
  body('items.*.productId').isString().notEmpty().withMessage('productId zorunludur'),
  body('items.*.variantId').optional().isString(),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('quantity en az 1 olmalıdır'),
  body('shippingAddress').isObject().withMessage('shippingAddress zorunludur'),
  body('shippingAddress.firstName').isString().trim().notEmpty().withMessage('Adres adı zorunludur'),
  body('shippingAddress.lastName').isString().trim().notEmpty().withMessage('Adres soyadı zorunludur'),
  body('shippingAddress.address').isString().trim().notEmpty().withMessage('Adres zorunludur'),
  body('shippingAddress.city').isString().trim().notEmpty().withMessage('Şehir zorunludur'),
  body('shippingAddress.phone').isString().trim().notEmpty().withMessage('Telefon zorunludur'),
  body('type').optional().isIn(['RETAIL', 'WHOLESALE']).withMessage('Sipariş tipi geçersiz'),
];

export const orderIdParamValidator = [
  param('id').isString().notEmpty().withMessage('Sipariş id zorunludur'),
];

export const updateOrderStatusValidator = [
  body('status')
    .isIn(['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
    .withMessage('Geçersiz sipariş durumu'),
];

export const initPaymentValidator = [
  body('orderId').isString().notEmpty().withMessage('orderId zorunludur'),
];

export const productIdParamValidator = [
  param('id').isString().notEmpty().withMessage('Ürün id zorunludur'),
];

export const createProductValidator = [
  body('slug').isString().trim().notEmpty().withMessage('slug zorunludur'),
  body('nameTR').isString().trim().notEmpty().withMessage('nameTR zorunludur'),
  body('nameEN').optional().isString().trim(),
  body('price').isFloat({ gt: 0 }).withMessage('price 0dan büyük olmalıdır'),
  body('stock').isInt({ min: 0 }).withMessage('stock 0 veya daha büyük olmalıdır'),
  body('categoryId').isString().notEmpty().withMessage('categoryId zorunludur'),
];

export const updateProductValidator = [
  body('slug').optional().isString().trim().notEmpty(),
  body('nameTR').optional().isString().trim().notEmpty(),
  body('nameEN').optional().isString().trim(),
  body('price').optional().isFloat({ gt: 0 }),
  body('stock').optional().isInt({ min: 0 }),
  body('categoryId').optional().isString().notEmpty(),
];
