import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed başlıyor...');

  // Admin kullanıcı
  const admin = await prisma.user.upsert({
    where: { email: 'admin@kahvekseni.com' },
    update: {},
    create: {
      email: 'admin@kahvekseni.com',
      passwordHash: await bcrypt.hash('Admin123!', 12),
      firstName: 'Admin',
      lastName: 'KAHVEKSENİ',
      role: 'ADMIN',
      isVerified: true,
      loyalty: { create: {} },
    },
  });
  console.log('Admin oluşturuldu:', admin.email);

  // Kategoriler
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'filtre-kahve' },
      update: {},
      create: {
        slug: 'filtre-kahve',
        nameTR: 'Filtre Kahve',
        nameEN: 'Filter Coffee',
        descriptionTR: 'En iyi filtre kahveler',
        descriptionEN: 'Best filter coffees',
        sortOrder: 1,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'espresso' },
      update: {},
      create: {
        slug: 'espresso',
        nameTR: 'Espresso',
        nameEN: 'Espresso',
        descriptionTR: 'Yoğun ve aromatik espresso',
        descriptionEN: 'Intense and aromatic espresso',
        sortOrder: 2,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'tek-kokenli' },
      update: {},
      create: {
        slug: 'tek-kokenli',
        nameTR: 'Tek Kökenli',
        nameEN: 'Single Origin',
        descriptionTR: 'Tek bölgeden seçme kahveler',
        descriptionEN: 'Handpicked single origin coffees',
        sortOrder: 3,
      },
    }),
    prisma.category.upsert({
      where: { slug: 'harman' },
      update: {},
      create: {
        slug: 'harman',
        nameTR: 'Harman',
        nameEN: 'Blend',
        descriptionTR: 'Özenle hazırlanmış harman kahveler',
        descriptionEN: 'Carefully crafted blend coffees',
        sortOrder: 4,
      },
    }),
  ]);
  console.log('Kategoriler oluşturuldu:', categories.map(c => c.nameTR));

  // Ürünler
  const products = [
    {
      slug: 'etiyopya-yirgacheffe',
      nameTR: 'Etiyopya Yirgacheffe',
      nameEN: 'Ethiopia Yirgacheffe',
      descriptionTR: 'Çiçeksi notaları ve limon kabuğu tonlarıyla eşsiz bir Etiyopya kahvesi. Açık kavurma ile en iyi şekilde hazırlanır.',
      descriptionEN: 'A unique Ethiopian coffee with floral notes and lemon peel tones. Best prepared with light roast.',
      shortDescTR: 'Çiçeksi & Narenciye',
      shortDescEN: 'Floral & Citrus',
      price: 189.90,
      wholesalePrice: 142.00,
      minWholesaleQty: 10,
      stock: 150,
      sku: 'KKS-ETY-001',
      imageUrls: ['https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=600'],
      isFeatured: true,
      origin: 'Etiyopya',
      roastLevel: 'Açık',
      flavorNotes: ['Çiçek', 'Limon', 'Yasemin', 'Bergamot'],
      categoryId: categories[2].id,
    },
    {
      slug: 'kolombiya-huila',
      nameTR: 'Kolombiya Huila',
      nameEN: 'Colombia Huila',
      descriptionTR: 'Karamel ve şeftali notalarıyla dengelenmiş, orta kavurma Kolombiya kahvesi.',
      descriptionEN: 'Balanced medium roast Colombian coffee with caramel and peach notes.',
      shortDescTR: 'Karamel & Şeftali',
      shortDescEN: 'Caramel & Peach',
      price: 169.90,
      wholesalePrice: 127.00,
      minWholesaleQty: 10,
      stock: 200,
      sku: 'KKS-KOL-001',
      imageUrls: ['https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=600'],
      isFeatured: true,
      origin: 'Kolombiya',
      roastLevel: 'Orta',
      flavorNotes: ['Karamel', 'Şeftali', 'Çikolata', 'Fındık'],
      categoryId: categories[0].id,
    },
    {
      slug: 'istanbul-harmani',
      nameTR: 'İstanbul Harmanı',
      nameEN: 'Istanbul Blend',
      descriptionTR: 'KAHVEKSENİ imzalı özel harmana. Brezilya ve Kolombiya çekirdeklerinin mükemmel uyumu.',
      descriptionEN: 'KAHVEKSENİ signature blend. Perfect harmony of Brazil and Colombia beans.',
      shortDescTR: 'Güçlü & Dengeli',
      shortDescEN: 'Strong & Balanced',
      price: 149.90,
      wholesalePrice: 112.00,
      minWholesaleQty: 20,
      stock: 500,
      sku: 'KKS-IST-001',
      imageUrls: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600'],
      isFeatured: true,
      origin: 'Brezilya & Kolombiya',
      roastLevel: 'Koyu',
      flavorNotes: ['Bitter Çikolata', 'Karamel', 'Fındık'],
      categoryId: categories[3].id,
    },
    {
      slug: 'brezilya-cerrado',
      nameTR: 'Brezilya Cerrado',
      nameEN: 'Brazil Cerrado',
      descriptionTR: 'Tatlı ve kremsi yapısıyla günlük içime uygun Brezilya kahvesi.',
      descriptionEN: 'Sweet and creamy Brazilian coffee perfect for daily consumption.',
      shortDescTR: 'Tatlı & Kremsi',
      shortDescEN: 'Sweet & Creamy',
      price: 139.90,
      wholesalePrice: 104.00,
      minWholesaleQty: 10,
      stock: 300,
      sku: 'KKS-BRZ-001',
      imageUrls: ['https://images.unsplash.com/photo-1610889556528-9a770e32642f?w=600'],
      isFeatured: false,
      origin: 'Brezilya',
      roastLevel: 'Orta-Koyu',
      flavorNotes: ['Fındık', 'Karamel', 'Vanilyali Krema'],
      categoryId: categories[1].id,
    },
  ];

  for (const productData of products) {
    const product = await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {},
      create: productData,
    });

    // Varyantlar
    const grindTypes = ['Bütün Çekirdek', 'Kaba Öğütme', 'Orta Öğütme', 'İnce Öğütme'];
    const weights = [250, 500, 1000];

    for (const weight of weights) {
      const priceMultiplier = weight === 250 ? 1 : weight === 500 ? 1.8 : 3.2;
      const basePrice = Number(productData.price) * priceMultiplier / 1;
      const wholesaleBase = Number(productData.wholesalePrice) * priceMultiplier / 1;

      for (const grind of grindTypes) {
        const sku = `${productData.sku}-${weight}G-${grind.replace(/\s+/g, '').substring(0, 3).toUpperCase()}`;
        await prisma.productVariant.upsert({
          where: { sku },
          update: {},
          create: {
            productId: product.id,
            grindType: grind,
            weight,
            price: Math.round(basePrice * 100) / 100,
            wholesalePrice: Math.round(wholesaleBase * 100) / 100,
            stock: 50,
            sku,
          },
        });
      }
    }
    console.log('Ürün oluşturuldu:', product.nameTR);
  }

  console.log('Seed tamamlandı!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
