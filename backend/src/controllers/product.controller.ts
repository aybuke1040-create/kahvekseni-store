import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { AuthRequest } from '../middlewares/auth.middleware';

export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      category,
      search,
      minPrice,
      maxPrice,
      featured,
      page = '1',
      limit = '12',
      lang = 'tr',
    } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: Record<string, unknown> = { isActive: true };
    if (category) where.category = { slug: category };
    if (featured === 'true') where.isFeatured = true;
    if (search) {
      where.OR = [
        { nameTR: { contains: search, mode: 'insensitive' } },
        { nameEN: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) (where.price as Record<string, unknown>).gte = parseFloat(minPrice as string);
      if (maxPrice) (where.price as Record<string, unknown>).lte = parseFloat(maxPrice as string);
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take,
        include: { category: true, variants: { where: { isActive: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.product.count({ where }),
    ]);

    const localized = products.map(p => formatProduct(p, lang as string));

    res.json({
      success: true,
      data: localized,
      pagination: {
        page: parseInt(page as string),
        limit: take,
        total,
        pages: Math.ceil(total / take),
      },
    });
  } catch {
    res.status(500).json({ success: false, message: 'Ürünler alınamadı' });
  }
};

export const getProduct = async (req: Request, res: Response): Promise<void> => {
  try {
    const { slug } = req.params;
    const lang = (req.query.lang as string) || 'tr';

    const product = await prisma.product.findUnique({
      where: { slug, isActive: true },
      include: {
        category: true,
        variants: { where: { isActive: true } },
      },
    });

    if (!product) {
      res.status(404).json({ success: false, message: 'Ürün bulunamadı' });
      return;
    }

    res.json({ success: true, data: formatProduct(product, lang) });
  } catch {
    res.status(500).json({ success: false, message: 'Ürün alınamadı' });
  }
};

export const getCategories = async (req: Request, res: Response): Promise<void> => {
  try {
    const lang = (req.query.lang as string) || 'tr';
    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { products: { where: { isActive: true } } } } },
    });

    const localized = categories.map(c => ({
      id: c.id,
      slug: c.slug,
      name: lang === 'en' ? c.nameEN : c.nameTR,
      description: lang === 'en' ? c.descriptionEN : c.descriptionTR,
      imageUrl: c.imageUrl,
      productCount: c._count.products,
    }));

    res.json({ success: true, data: localized });
  } catch {
    res.status(500).json({ success: false, message: 'Kategoriler alınamadı' });
  }
};

export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.create({
      data: req.body,
      include: { category: true },
    });
    res.status(201).json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, message: 'Ürün oluşturulamadı' });
  }
};

export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: product });
  } catch {
    res.status(500).json({ success: false, message: 'Ürün güncellenemedi' });
  }
};

function formatProduct(p: Record<string, unknown>, lang: string) {
  return {
    id: p.id,
    slug: p.slug,
    nameTR: p.nameTR,
    nameEN: p.nameEN,
    name: lang === 'en' ? p.nameEN : p.nameTR,
    description: lang === 'en' ? p.descriptionEN : p.descriptionTR,
    shortDesc: lang === 'en' ? p.shortDescEN : p.shortDescTR,
    price: p.price,
    wholesalePrice: p.wholesalePrice,
    minWholesaleQty: p.minWholesaleQty,
    stock: p.stock,
    sku: p.sku,
    imageUrls: p.imageUrls,
    isFeatured: p.isFeatured,
    origin: p.origin,
    roastLevel: p.roastLevel,
    flavorNotes: p.flavorNotes,
    category: p.category,
    variants: p.variants,
  };
}
