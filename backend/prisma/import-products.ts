import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';

type ImportVariant = {
  grindType?: string;
  weight?: number;
  price: number;
  wholesalePrice: number;
  stock?: number;
  sku: string;
};

type ImportProduct = {
  nameTR: string;
  nameEN?: string;
  slug: string;
  descriptionTR?: string;
  descriptionEN?: string;
  shortDesc?: string;
  shortDescTR?: string;
  shortDescEN?: string;
  category: string;
  origin?: string;
  roastLevel?: string;
  flavorNotes?: string[];
  imageUrls?: string[];
  imageUrl?: string;
  isFeatured?: boolean;
  sortOrder?: number;
  minWholesaleQty?: number;
  variants?: ImportVariant[];
};

type ImportPayload = {
  products: ImportProduct[];
};

const prisma = new PrismaClient();

const slugify = (value: string) =>
  value
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-+/g, '-');

async function main() {
  const filePath = path.join(__dirname, 'import-products.json');
  const raw = await fs.readFile(filePath, 'utf8');
  const payload = JSON.parse(raw) as ImportPayload;

  if (!Array.isArray(payload.products)) {
    throw new Error('import-products.json içinde products dizisi bulunamadı');
  }

  for (const product of payload.products) {
    const categorySlug = slugify(product.category);
    const category = await prisma.category.upsert({
      where: { slug: categorySlug },
      update: {
        nameTR: product.category,
        nameEN: product.category,
        ...(typeof product.sortOrder === 'number' ? { sortOrder: product.sortOrder } : {}),
      },
      create: {
        slug: categorySlug,
        nameTR: product.category,
        nameEN: product.category,
        sortOrder: product.sortOrder ?? 0,
      },
    });

    const variants = Array.isArray(product.variants) ? product.variants : [];
    const firstVariant = variants[0];

    if (!firstVariant) {
      // Product kaydı için zorunlu fiyat/sku alanları variants'tan geldiği için variants yoksa atla.
      continue;
    }

    const imageUrls = Array.isArray(product.imageUrls)
      ? product.imageUrls.filter(Boolean)
      : product.imageUrl
        ? [product.imageUrl]
        : [];

    const upsertedProduct = await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        nameTR: product.nameTR,
        nameEN: product.nameEN || product.nameTR,
        descriptionTR: product.descriptionTR || null,
        descriptionEN: product.descriptionEN || product.descriptionTR || null,
        shortDescTR: product.shortDescTR || product.shortDesc || null,
        shortDescEN: product.shortDescEN || product.shortDesc || null,
        price: firstVariant.price,
        wholesalePrice: firstVariant.wholesalePrice,
        stock: firstVariant.stock ?? 0,
        sku: firstVariant.sku,
        imageUrls,
        isFeatured: Boolean(product.isFeatured),
        origin: product.origin || null,
        roastLevel: product.roastLevel || null,
        flavorNotes: Array.isArray(product.flavorNotes) ? product.flavorNotes : [],
        minWholesaleQty: product.minWholesaleQty ?? 10,
        categoryId: category.id,
      },
      create: {
        slug: product.slug,
        nameTR: product.nameTR,
        nameEN: product.nameEN || product.nameTR,
        descriptionTR: product.descriptionTR || null,
        descriptionEN: product.descriptionEN || product.descriptionTR || null,
        shortDescTR: product.shortDescTR || product.shortDesc || null,
        shortDescEN: product.shortDescEN || product.shortDesc || null,
        price: firstVariant.price,
        wholesalePrice: firstVariant.wholesalePrice,
        stock: firstVariant.stock ?? 0,
        sku: firstVariant.sku,
        imageUrls,
        isFeatured: Boolean(product.isFeatured),
        origin: product.origin || null,
        roastLevel: product.roastLevel || null,
        flavorNotes: Array.isArray(product.flavorNotes) ? product.flavorNotes : [],
        minWholesaleQty: product.minWholesaleQty ?? 10,
        categoryId: category.id,
      },
    });

    for (const variant of variants) {
      await prisma.productVariant.upsert({
        where: { sku: variant.sku },
        update: {
          productId: upsertedProduct.id,
          grindType: variant.grindType || null,
          weight: typeof variant.weight === 'number' ? variant.weight : null,
          price: variant.price,
          wholesalePrice: variant.wholesalePrice,
          stock: variant.stock ?? 0,
        },
        create: {
          productId: upsertedProduct.id,
          grindType: variant.grindType || null,
          weight: typeof variant.weight === 'number' ? variant.weight : null,
          price: variant.price,
          wholesalePrice: variant.wholesalePrice,
          stock: variant.stock ?? 0,
          sku: variant.sku,
        },
      });
    }
  }
}

main()
  .then(() => {
    console.log('import-products tamamlandı');
  })
  .catch((error) => {
    console.error('import-products hata:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
