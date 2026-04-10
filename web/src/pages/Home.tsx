import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { apiDataArray, safeArray } from '../lib/api-helpers';
import ProductCard from '../components/product/ProductCard';

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  imageUrls: string[];
  isFeatured: boolean;
  origin: string;
  roastLevel: string;
  flavorNotes: string[];
  stock: number;
}

interface Category {
  id: string;
  slug: string;
  name: string;
  imageUrl?: string;
}

export default function Home() {
  const { t } = useTranslation();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=3').then(r => setFeatured(apiDataArray<Product>(r))).catch(() => {
      setFeatured([
        { id: '1', slug: 'demo', name: 'Etiyopya Yirgacheffe', shortDesc: 'Çiçeksi & Narenciye', price: 189.90, imageUrls: ['https://images.unsplash.com/photo-1611854779393-1b2da9d400fe?w=400'], isFeatured: true, origin: 'Etiyopya', roastLevel: 'Açık', flavorNotes: ['Çiçek', 'Limon'], stock: 50 },
        { id: '2', slug: 'demo2', name: 'Kolombiya Huila', shortDesc: 'Karamel & Şeftali', price: 169.90, imageUrls: ['https://images.unsplash.com/photo-1504630083234-14187a9df0f5?w=400'], isFeatured: true, origin: 'Kolombiya', roastLevel: 'Orta', flavorNotes: ['Karamel', 'Şeftali'], stock: 80 },
        { id: '3', slug: 'demo3', name: 'İstanbul Harmanı', shortDesc: 'Güçlü & Dengeli', price: 149.90, imageUrls: ['https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'], isFeatured: true, origin: 'Brezilya & Kolombiya', roastLevel: 'Koyu', flavorNotes: ['Çikolata', 'Karamel'], stock: 200 },
      ]);
    });
    api.get('/products/categories').then(r => setCategories(apiDataArray<Category>(r))).catch(() => setCategories([]));
  }, []);

  const safeCategories = safeArray<Category>(categories);
  const safeFeatured = safeArray<Product>(featured);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-brand-brown text-brand-cream overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1920)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 md:py-40">
          <div className="max-w-2xl">
            <p className="text-brand-gold font-semibold uppercase tracking-widest text-sm mb-4">Premium Kahve</p>
            <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6 whitespace-pre-line">
              {t('home.hero_title')}
            </h1>
            <p className="text-lg text-brand-cream-dark opacity-90 mb-8 max-w-lg">
              {t('home.hero_subtitle')}
            </p>
            <Link to="/shop" className="btn-gold text-base px-8 py-4 inline-block">
              {t('home.hero_cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: '☕', title: t('home.why_fresh'), desc: t('home.why_fresh_desc') },
              { icon: '⭐', title: t('home.why_quality'), desc: t('home.why_quality_desc') },
              { icon: '🚀', title: t('home.why_delivery'), desc: t('home.why_delivery_desc') },
            ].map((item) => (
              <div key={item.title} className="p-6">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-semibold text-brand-brown text-lg mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      {safeCategories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-brand-brown mb-8 text-center">{t('home.categories_title')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {safeCategories.map((cat) => (
              <Link
                key={cat.id}
                to={`/shop?category=${cat.slug}`}
                className="relative aspect-square rounded-2xl overflow-hidden group"
              >
                <div className="absolute inset-0 bg-brand-brown-light group-hover:bg-brand-brown transition-colors" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-white font-semibold text-lg text-center px-4">{cat.name}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-brand-brown mb-2">{t('home.featured_title')}</h2>
          <p className="text-gray-500">{t('home.featured_subtitle')}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {safeFeatured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-10">
          <Link to="/shop" className="btn-secondary inline-block">
            Tüm Ürünleri Gör
          </Link>
        </div>
      </section>

      {/* Story */}
      <section className="bg-brand-brown text-brand-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-gold uppercase tracking-widest text-sm font-semibold mb-4">Hikayemiz</p>
              <h2 className="text-4xl font-bold mb-6">{t('home.story_title')}</h2>
              <p className="text-brand-cream-dark opacity-80 leading-relaxed mb-6">
                {t('home.story_text')}
              </p>
              <Link to="/b2b" className="btn-gold inline-block">Toptan Satış için İletişim</Link>
            </div>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600"
                alt="Kahve kavurma"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
