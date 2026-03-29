import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  items: Array<{ productName: string; quantity: number }>;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Beklemede', color: 'bg-yellow-100 text-yellow-800' },
  PAYMENT_PENDING: { label: 'Ödeme Bekleniyor', color: 'bg-orange-100 text-orange-800' },
  PAID: { label: 'Ödendi', color: 'bg-blue-100 text-blue-800' },
  PROCESSING: { label: 'Hazırlanıyor', color: 'bg-purple-100 text-purple-800' },
  SHIPPED: { label: 'Kargoya Verildi', color: 'bg-indigo-100 text-indigo-800' },
  DELIVERED: { label: 'Teslim Edildi', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'İptal Edildi', color: 'bg-red-100 text-red-800' },
};

export default function Account() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.get('/orders')
      .then(r => setOrders(r.data.data))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card p-6 text-center">
            <div className="w-16 h-16 bg-brand-brown rounded-full flex items-center justify-center text-brand-gold text-2xl font-bold mx-auto mb-3">
              {user?.firstName?.charAt(0)}
            </div>
            <h3 className="font-bold text-brand-brown">{user?.firstName} {user?.lastName}</h3>
            <p className="text-sm text-gray-500">{user?.email}</p>
            <span className="inline-block mt-2 text-xs bg-brand-cream text-brand-brown-light px-2 py-1 rounded-full">
              {user?.role === 'WHOLESALE' ? 'Toptan Müşteri' : user?.role === 'ADMIN' ? 'Admin' : 'Bireysel Müşteri'}
            </span>
          </div>
          <button
            onClick={() => { logout(); navigate('/'); }}
            className="w-full mt-3 btn-secondary text-red-600 border-red-200 hover:bg-red-50 hover:border-red-400"
          >
            {t('nav.logout')}
          </button>
        </aside>

        {/* Orders */}
        <div className="lg:col-span-3">
          <h2 className="text-2xl font-bold text-brand-brown mb-6">Siparişlerim</h2>
          {loading ? (
            <div className="text-center py-10"><div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>
          ) : orders.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-gray-400">Henüz siparişiniz yok</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div key={order.id} className="card p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-brand-brown">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusLabels[order.status]?.color || 'bg-gray-100 text-gray-600'}`}>
                        {statusLabels[order.status]?.label || order.status}
                      </span>
                      <p className="text-lg font-bold text-brand-brown mt-1">{Number(order.total).toFixed(2)} TL</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {order.items?.map((item) => (
                      <span key={item.productName}>{item.productName} x{item.quantity} </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
