import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { createCheckoutForm, retrieveCheckoutForm } from '../services/iyzico.service';
import { AuthRequest } from '../middlewares/auth.middleware';

export const initPayment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { orderId } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    const order = await prisma.order.findFirst({
      where: { id: orderId, userId: req.user!.id },
      include: { items: { include: { product: true } } },
    });

    if (!order || !user) {
      res.status(404).json({ success: false, message: 'Sipariş bulunamadı' });
      return;
    }

    const addr = (order.shippingAddress as Record<string, string>) || {};

    const result = await createCheckoutForm({
      orderId: order.id,
      amount: Number(order.total),
      currency: 'TRY',
      buyer: {
        id: user.id,
        name: user.firstName,
        surname: user.lastName,
        email: user.email,
        identityNumber: '11111111111',
        registrationAddress: addr.address || 'Türkiye',
        city: addr.city || 'Istanbul',
        country: 'Turkey',
        ip: req.ip || '127.0.0.1',
      },
      shippingAddress: {
        contactName: `${user.firstName} ${user.lastName}`,
        city: addr.city || 'Istanbul',
        country: 'Turkey',
        address: addr.address || 'Türkiye',
      },
      billingAddress: {
        contactName: `${user.firstName} ${user.lastName}`,
        city: addr.city || 'Istanbul',
        country: 'Turkey',
        address: addr.address || 'Türkiye',
      },
      basketItems: order.items.map(item => ({
        id: item.productId,
        name: item.productName,
        category1: 'Kahve',
        itemType: 'PHYSICAL',
        price: Number(item.total).toFixed(2),
      })),
    });

    if ((result as Record<string, unknown>).status === 'success') {
      await prisma.payment.upsert({
        where: { orderId: order.id },
        create: {
          orderId: order.id,
          iyzicoToken: (result as Record<string, unknown>).token as string,
          status: 'PENDING',
          amount: order.total,
        },
        update: {
          iyzicoToken: (result as Record<string, unknown>).token as string,
          status: 'PENDING',
        },
      });

      await prisma.order.update({
        where: { id: order.id },
        data: { status: 'PAYMENT_PENDING' },
      });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ödeme başlatılamadı' });
  }
};

export const paymentCallback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;
    const result = await retrieveCheckoutForm(token);

    const payment = await prisma.payment.findFirst({
      where: { iyzicoToken: token },
      include: { order: true },
    });

    if (!payment) {
      res.redirect(`${process.env.WEB_URL}/payment/failed`);
      return;
    }

    if ((result as Record<string, unknown>).status === 'success' &&
        (result as Record<string, unknown>).paymentStatus === 'SUCCESS') {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'SUCCESS',
            iyzicoPaymentId: (result as Record<string, unknown>).paymentId as string,
            paymentMethod: (result as Record<string, unknown>).paymentChannel as string,
            rawResponse: result as Record<string, unknown>,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAID' },
        }),
      ]);

      // Earn loyalty points
      const order = payment.order;
      if (order.pointsEarned > 0) {
        const loyalty = await prisma.loyaltyAccount.findUnique({ where: { userId: order.userId } });
        if (loyalty) {
          const newPoints = loyalty.points - order.pointsUsed + order.pointsEarned;
          const totalEarned = loyalty.totalEarned + order.pointsEarned;
          const tier = totalEarned >= 2000 ? 'GOLD' : totalEarned >= 500 ? 'SILVER' : 'BRONZE';
          await prisma.loyaltyAccount.update({
            where: { id: loyalty.id },
            data: { points: newPoints, totalEarned, tier },
          });
          await prisma.pointTransaction.create({
            data: {
              loyaltyId: loyalty.id,
              type: 'EARN',
              points: order.pointsEarned,
              description: `Sipariş #${order.orderNumber} ödendi`,
              orderId: order.id,
            },
          });
        }
      }

      res.redirect(`${process.env.WEB_URL}/payment/success?orderId=${payment.orderId}`);
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: 'FAILED', rawResponse: result as Record<string, unknown> },
      });
      res.redirect(`${process.env.WEB_URL}/payment/failed?orderId=${payment.orderId}`);
    }
  } catch {
    res.redirect(`${process.env.WEB_URL}/payment/failed`);
  }
};
