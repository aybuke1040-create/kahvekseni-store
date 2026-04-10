import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { apiDataArray, safeArray } from '../lib/api-helpers';
import { useAuthStore } from '../store/authStore';

type AdminTab = 'products' | 'orders';

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  nameTR?: string;
  nameEN?: string;
  price: number;
  wholesalePrice: number;
  stock: number;
  sku: string;
  imageUrls?: string[];
  category?: { id?: string; name?: string };
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  user?: { firstName?: string; lastName?: string; email?: string };
}

interface ProductForm {
  id?: string;
  slug: string;
  nameTR: string;
  nameEN: string;
  price: string;
  wholesalePrice: string;
  stock: string;
  sku: string;
  categoryId: string;
  imageUrls: string;
}

const ORDER_STATUSES = ['PENDING', 'PAYMENT_PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'];

const emptyForm: ProductForm = {
  slug: '',
  nameTR: '',
  nameEN: '',
  price: '',
  wholesalePrice: '',
  stock: '0',
  sku: '',
  categoryId: '',
  imageUrls: '',
};

export default function Admin() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const [tab, setTab] = useState<AdminTab>('products');
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<ProductForm>(emptyForm);

  const isAdmin = isAuthenticated && user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user?.role !== 'ADMIN') {
      navigate('/account');
      return;
    }
  }, [isAuthenticated, user?.role, navigate]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        api.get('/products?limit=100'),
        api.get('/products/categories'),
        api.get('/orders/admin'),
      ]);
      setProducts(apiDataArray<Product>(productsRes));
      setCategories(apiDataArray<Category>(categoriesRes));
      setOrders(apiDataArray<Order>(ordersRes));
    } catch {
      setProducts([]);
      setCategories([]);
      setOrders([]);
      toast.error('Admin verileri alınamadı');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAdmin) return;
    fetchAll();
  }, [isAdmin]);

  const formTitle = useMemo(() => (form.id ? 'Ürün Düzenle' : 'Yeni Ürün Ekle'), [form.id]);

  const resetForm = () => setForm(emptyForm);

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        slug: form.slug.trim(),
        nameTR: form.nameTR.trim(),
        nameEN: form.nameEN.trim(),
        price: Number(form.price),
        wholesalePrice: Number(form.wholesalePrice),
        stock: Number(form.stock),
        sku: form.sku.trim(),
        categoryId: form.categoryId,
        imageUrls: form.imageUrls
          .split(',')
          .map((i) => i.trim())
          .filter(Boolean),
        flavorNotes: [],
      };

      if (form.id) {
        await api.put(`/products/${form.id}`, payload);
        toast.success('Ürün güncellendi');
      } else {
        await api.post('/products', payload);
        toast.success('Ürün eklendi');
      }
      resetForm();
      await fetchAll();
    } catch {
      toast.error('Ürün kaydedilemedi');
    } finally {
      setSaving(false);
    }
  };

  const editProduct = (p: Product) => {
    setForm({
      id: p.id,
      slug: p.slug || '',
      nameTR: p.nameTR || p.name || '',
      nameEN: p.nameEN || '',
      price: String(p.price ?? ''),
      wholesalePrice: String(p.wholesalePrice ?? ''),
      stock: String(p.stock ?? 0),
      sku: p.sku || '',
      categoryId: p.category?.id || '',
      imageUrls: safeArray<string>(p.imageUrls).join(', '),
    });
    setTab('products');
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await api.patch(`/orders/${orderId}/status`, { status });
      toast.success('Sipariş durumu güncellendi');
      setOrders((prev) => safeArray<Order>(prev).map((o) => (o.id === orderId ? { ...o, status } : o)));
    } catch {
      toast.error('Sipariş durumu güncellenemedi');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-brand-brown">Admin Panel</h1>
        <div className="flex gap-2">
          <button onClick={() => setTab('products')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'products' ? 'bg-brand-brown text-brand-cream' : 'bg-gray-100'}`}>Ürünler</button>
          <button onClick={() => setTab('orders')} className={`px-4 py-2 rounded-lg text-sm ${tab === 'orders' ? 'bg-brand-brown text-brand-cream' : 'bg-gray-100'}`}>Siparişler</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Yükleniyor...</div>
      ) : tab === 'products' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form onSubmit={handleProductSubmit} className="card p-5 space-y-3 lg:col-span-1">
            <h2 className="text-lg font-semibold text-brand-brown">{formTitle}</h2>
            <input className="input-field" placeholder="Slug" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} required />
            <input className="input-field" placeholder="Ad (TR)" value={form.nameTR} onChange={(e) => setForm({ ...form, nameTR: e.target.value })} required />
            <input className="input-field" placeholder="Ad (EN)" value={form.nameEN} onChange={(e) => setForm({ ...form, nameEN: e.target.value })} required />
            <input className="input-field" type="number" step="0.01" placeholder="Fiyat" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            <input className="input-field" type="number" step="0.01" placeholder="Toptan Fiyat" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} required />
            <input className="input-field" type="number" min={0} placeholder="Stok" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} required />
            <input className="input-field" placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required />
            <select className="input-field" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required>
              <option value="">Kategori seç</option>
              {safeArray<Category>(categories).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <input className="input-field" placeholder="Görsel URL(ler) virgülle" value={form.imageUrls} onChange={(e) => setForm({ ...form, imageUrls: e.target.value })} />
            <div className="flex gap-2">
              <button type="submit" disabled={saving} className="btn-primary flex-1">{saving ? 'Kaydediliyor...' : 'Kaydet'}</button>
              <button type="button" onClick={resetForm} className="btn-secondary">Temizle</button>
            </div>
          </form>

          <div className="lg:col-span-2 card p-5 overflow-auto">
            <h2 className="text-lg font-semibold text-brand-brown mb-4">Ürün Listesi</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Ad</th>
                  <th className="py-2">SKU</th>
                  <th className="py-2">Fiyat</th>
                  <th className="py-2">Stok</th>
                  <th className="py-2">İşlem</th>
                </tr>
              </thead>
              <tbody>
                {safeArray<Product>(products).map((p) => (
                  <tr key={p.id} className="border-b">
                    <td className="py-2">{p.name}</td>
                    <td className="py-2">{p.sku}</td>
                    <td className="py-2">{Number(p.price).toFixed(2)} TL</td>
                    <td className="py-2">{p.stock}</td>
                    <td className="py-2">
                      <button onClick={() => editProduct(p)} className="text-brand-brown hover:underline">Düzenle</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card p-5 overflow-auto">
          <h2 className="text-lg font-semibold text-brand-brown mb-4">Siparişler</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="py-2">No</th>
                <th className="py-2">Müşteri</th>
                <th className="py-2">Tutar</th>
                <th className="py-2">Tarih</th>
                <th className="py-2">Durum</th>
              </tr>
            </thead>
            <tbody>
              {safeArray<Order>(orders).map((o) => (
                <tr key={o.id} className="border-b">
                  <td className="py-2">{o.orderNumber}</td>
                  <td className="py-2">{o.user?.firstName} {o.user?.lastName}<br /><span className="text-gray-400">{o.user?.email}</span></td>
                  <td className="py-2">{Number(o.total).toFixed(2)} TL</td>
                  <td className="py-2">{new Date(o.createdAt).toLocaleDateString('tr-TR')}</td>
                  <td className="py-2">
                    <select
                      value={o.status}
                      onChange={(e) => updateOrderStatus(o.id, e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 bg-white"
                    >
                      {ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
