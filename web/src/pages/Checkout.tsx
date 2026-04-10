import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { apiData, safeArray } from '../lib/api-helpers';
import { CartItem, useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export default function Checkout() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { items, total } = useCartStore();
  const safeItems = safeArray<CartItem>(items);
  const { isAuthenticated } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', phone: '',
    address: '', city: '', district: '', zip: '',
  });

  const shipping = total >= 500 ? 0 : 29.99;
  const grandTotal = total + shipping;

  if (!isAuthenticated) {
    navigate('/login');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (safeItems.length === 0) { toast.error('Sepetiniz boş'); return; }
    setLoading(true);
    try {
      const orderRes = await api.post('/orders', {
        items: safeItems.map(i => ({
          productId: i.productId,
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        shippingAddress: form,
      });

      const order = apiData<{ id?: string }>(orderRes);
      const payRes = await api.post('/payment/init', { orderId: order?.id });
      const payment = apiData<{ checkoutFormContent?: string }>(payRes);
      if (payment?.checkoutFormContent) {
        // Open İyzico form in modal/redirect
        document.open();
        document.write(payment.checkoutFormContent);
        document.close();
      } else {
        toast.error('Ödeme formu alınamadı. Lütfen tekrar deneyin.');
      }
    } catch (err) {
      toast.error('Sipariş oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-brand-brown mb-8">{t('checkout.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-4">
          <h2 className="text-xl font-semibold text-brand-brown">{t('checkout.shipping_info')}</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.first_name')}</label>
              <input name="firstName" value={form.firstName} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.last_name')}</label>
              <input name="lastName" value={form.lastName} onChange={handleChange} required className="input-field" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.phone')}</label>
            <input name="phone" value={form.phone} onChange={handleChange} required className="input-field" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">{t('checkout.address')}</label>
            <input name="address" value={form.address} onChange={handleChange} required className="input-field" />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.city')}</label>
              <input name="city" value={form.city} onChange={handleChange} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.district')}</label>
              <input name="district" value={form.district} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('checkout.zip')}</label>
              <input name="zip" value={form.zip} onChange={handleChange} className="input-field" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full mt-4">
            {loading ? t('checkout.processing') : t('checkout.pay_now')}
          </button>
        </form>

        {/* Order summary */}
        <div className="card p-6 h-fit">
          <h2 className="text-xl font-semibold text-brand-brown mb-4">{t('checkout.order_summary')}</h2>
          <div className="space-y-3 text-sm mb-4">
            {safeItems.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span className="text-gray-600 truncate pr-2">{item.name} x{item.quantity}</span>
                <span className="font-medium shrink-0">{(item.price * item.quantity).toFixed(2)} TL</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-3 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-gray-500">Ara Toplam</span><span>{total.toFixed(2)} TL</span></div>
            <div className="flex justify-between"><span className="text-gray-500">Kargo</span><span>{shipping === 0 ? 'Ücretsiz' : `${shipping.toFixed(2)} TL`}</span></div>
            <div className="flex justify-between text-base font-bold pt-2 border-t">
              <span>Toplam</span><span>{grandTotal.toFixed(2)} TL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
