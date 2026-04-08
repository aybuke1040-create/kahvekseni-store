import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

const generateOrderNumber = () =>
  `KKS-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

const POINTS_PER_TL = parseInt(process.env.POINTS_PER_TL || '1');

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { items, shippingAddress, notes, pointsToUse = 0, type = 'RETAIL' } = req.body;
    const userId = req.user!.id;

    // Fetch products & validate stock
    const productIds = items.map((i: { productId: string }) => i.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      include: { variants: true },
    });

    const isWholesale = type === 'WHOLESALE' || req.user!.role === 'WHOLESALE';

    let subtotal = 0;
    const orderItems = items.map((item: { productId: string; variantId?: string; quantity: number }) => {
      const product = products.find(p => p.id === item.productId);
      if (!product) throw new Error(`Ürün bulunamadı: ${item.productId}`);
      if (product.stock < item.quantity) throw new Error(`Stok yetersiz: ${product.nameTR}`);

      const variant = item.variantId
        ? product.variants.find(v => v.id === item.variantId)
        : null;

      const unitPrice = isWholesale
        ? Number(variant?.wholesalePrice || product.wholesalePrice)
        : Number(variant?.price || product.price);

      const total = unitPrice * item.quantity;
      subtotal += total;

      return {
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice,
        total,
        productName: product.nameTR,
        variantInfo: variant ? { grindType: variant.grindType, weight: variant.weight } : null,
      };
    });

    // Loyalty points discount
    let discountAmount = 0;
    if (pointsToUse > 0) {
      const loyalty = await prisma.loyaltyAccount.findUnique({ where: { userId } });
      if (loyalty && loyalty.points >= pointsToUse) {
        discountAmount = pointsToUse * 0.01; // 1 puan = 0.01 TL
      }
    }

    const shippingCost = subtotal >= 500 ? 0 : 29.99;
    const total = Math.max(0, subtotal - discountAmount + shippingCost);
    const pointsEarned = Math.floor(total * POINTS_PER_TL);

    const order = await prisma.order.create({
      data: {
        orderNumber: generateOrderNumber(),
        userId,
        type: isWholesale ? 'WHOLESALE' : 'RETAIL',
        status: 'PENDING',
        subtotal,
        discountAmount,
        pointsUsed: pointsToUse,
        pointsEarned,
        shippingCost,
        total,
        shippingAddress,
        notes,
        items: { create: orderItems },
      },
      include: { items: { include: { product: true } } },
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: (error as Error).message });
  }
};

export const getOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user!.id },
      include: {
        items: { include: { product: { select: { nameTR: true, imageUrls: true } } } },
        payment: { select: { status: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, message: 'Siparişler alınamadı' });
  }
};

export const getOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id, userId: req.user!.id },
      include: {
        items: { include: { product: true, variant: true } },
        payment: true,
      },
    });
    if (!order) {
      res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
      return;
    }
    res.json({ success: true, data: order });
  } catch {
    res.status(500).json({ success: false, message: 'Sipariş alınamadı' });
  }
};

export const completeOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findFirst({
      where: { id: req.params.id },
    });
    if (!order) {
      res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'PAID' },
      });

      // Loyalty points
      if (order.pointsEarned > 0) {
        const loyalty = await tx.loyaltyAccount.findUnique({ where: { userId: order.userId } });
        if (loyalty) {
          const newPoints = loyalty.points - order.pointsUsed + order.pointsEarned;
          const totalEarned = loyalty.totalEarned + order.pointsEarned;
          const tier = totalEarned >= 2000 ? 'GOLD' : totalEarned >= 500 ? 'SILVER' : 'BRONZE';

          await tx.loyaltyAccount.update({
            where: { id: loyalty.id },
            data: {
              points: newPoints,
              totalEarned,
              totalSpent: loyalty.totalSpent + order.pointsUsed,
              tier,
            },
          });

          await tx.pointTransaction.create({
            data: {
              loyaltyId: loyalty.id,
              type: 'EARN',
              points: order.pointsEarned,
              description: `Sipariş #${order.orderNumber} tamamlandı`,
              orderId: order.id,
            },
          });
        }
      }
    });

    res.json({ success: true, message: 'Sipariş tamamlandı' });
  } catch {
    res.status(500).json({ success: false, message: 'Sipariş tamamlanamadı' });
  }
};

export const getAllOrdersAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        items: { include: { product: { select: { nameTR: true } } } },
        payment: { select: { status: true, paymentMethod: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 200,
    });
    res.json({ success: true, data: orders });
  } catch {
    res.status(500).json({ success: false, message: 'Siparişler alınamadı' });
  }
};

export const updateOrderStatusAdmin = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status: string };

    const existing = await prisma.order.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
      return;
    }

    const updated = await prisma.order.update({
      where: { id },
      data: { status: status as never },
      include: {
        user: { select: { id: true, email: true, firstName: true, lastName: true } },
        payment: { select: { status: true, paymentMethod: true } },
      },
    });

    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: 'Sipariş durumu güncellenemedi' });
  }
};
