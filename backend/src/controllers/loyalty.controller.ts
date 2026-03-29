import { Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getLoyalty = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const loyalty = await prisma.loyaltyAccount.findUnique({
      where: { userId: req.user!.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });
    if (!loyalty) {
      res.status(404).json({ success: false, message: 'Sadakat hesabı bulunamadı' });
      return;
    }
    res.json({ success: true, data: loyalty });
  } catch {
    res.status(500).json({ success: false, message: 'Sadakat bilgileri alınamadı' });
  }
};

export const getTierInfo = (_req: AuthRequest, res: Response): void => {
  res.json({
    success: true,
    data: {
      tiers: [
        {
          name: 'BRONZE',
          label: 'Bronz',
          minPoints: 0,
          maxPoints: 499,
          benefits: ['Her TL = 1 puan', 'Ücretsiz kargo (500 TL üzeri)'],
          color: '#CD7F32',
        },
        {
          name: 'SILVER',
          label: 'Gümüş',
          minPoints: 500,
          maxPoints: 1999,
          benefits: ['Her TL = 1.5 puan', 'Ücretsiz kargo (300 TL üzeri)', 'Özel indirimler'],
          color: '#C0C0C0',
        },
        {
          name: 'GOLD',
          label: 'Altın',
          minPoints: 2000,
          maxPoints: null,
          benefits: ['Her TL = 2 puan', 'Her zaman ücretsiz kargo', 'Öncelikli destek', 'Özel ürünlere erken erişim'],
          color: '#C8963E',
        },
      ],
    },
  });
};
