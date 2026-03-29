import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';

export const submitB2BRequest = async (req: Request, res: Response): Promise<void> => {
  try {
    const { companyName, contactName, email, phone, taxNumber, city, message } = req.body;

    const request = await prisma.b2BRequest.create({
      data: { companyName, contactName, email, phone, taxNumber, city, message },
    });

    res.status(201).json({
      success: true,
      message: 'Toptan satış talebiniz alındı. En kısa sürede size ulaşacağız.',
      data: { id: request.id },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Talep gönderilemedi' });
  }
};

export const getB2BRequests = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await prisma.b2BRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, data: requests });
  } catch {
    res.status(500).json({ success: false, message: 'Talepler alınamadı' });
  }
};
