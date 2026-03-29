import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
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

interface Category { id: string; slug: string; name: string; }

export default function Shop() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const r = await api.get('/products/categories');
        setCategories(r.data.data);
      } catch {}
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set('search', search);
        if (category) params.set('category', category);
        params.set('page', String(page));
        const r = await api.get(`/products?${params}`);
        setProducts(r.data.data);
        setTotal(r.data.pagination.total);
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [search, category, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-brand-brown mb-8">{t('shop.title')}</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 shrink-0">
          {/* Search */}
          <div className="mb-6">
            <input
              type="text"
              placeholder={t('shop.search_placeholder')}
              defaultValue={search}
              onChange={(e) => {
                const s = new URLSearchParams(searchParams);
                if (e.target.value) s.set('search', e.target.value);
                else s.delete('search');
                setSearchParams(s);
              }}
              className="input-field"
            />
          </div>

          {/* Categories */}
          <div className="mb-6">
            <h3 className="font-semibold text-brand-brown mb-3">{t('shop.filter_category')}</h3>
            <div className="space-y-2">
              <button
                onClick={() => { const s = new URLSearchParams(searchParams); s.delete('category'); setSearchParams(s); }}
                className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${!category ? 'bg-brand-brown text-brand-cream' : 'hover:bg-brand-cream'}`}
              >
                {t('shop.filter_all')}
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => { const s = new URLSearchParams(searchParams); s.set('category', cat.slug); setSearchParams(s); }}
                  className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${category === cat.slug ? 'bg-brand-brown text-brand-cream' : 'hover:bg-brand-cream'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Products */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="card animate-pulse">
                  <div className="aspect-square bg-gray-200" />
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-8 bg-gray-200 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-gray-400 text-lg">{t('shop.no_results')}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-4">{total} ürün bulundu</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {/* Pagination */}
              {total > 12 && (
                <div className="flex justify-center gap-2 mt-8">
                  {[...Array(Math.ceil(total / 12))].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${page === i + 1 ? 'bg-brand-brown text-brand-cream' : 'hover:bg-brand-cream'}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
