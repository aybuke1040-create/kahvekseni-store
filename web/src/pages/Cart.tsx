import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CartItem, useCartStore } from '../store/cartStore';
import { safeArray } from '../lib/api-helpers';

export default function Cart() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const safeItems = safeArray<CartItem>(items);

  const shipping = total >= 500 ? 0 : 29.99;
  const grandTotal = total + shipping;

  if (safeItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="text-6xl mb-4">🛒</div>
        <h2 className="text-2xl font-bold text-brand-brown mb-2">{t('cart.empty')}</h2>
        <p className="text-gray-500 mb-6">{t('cart.empty_desc')}</p>
        <Link to="/shop" className="btn-primary inline-block">{t('cart.continue_shopping')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-brand-brown mb-8">{t('cart.title')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {safeItems.map((item) => (
            <div key={item.id} className="card p-4 flex gap-4">
              <img
                src={item.imageUrl || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100'}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-brand-brown truncate">{item.name}</h3>
                {item.weight && (
                  <p className="text-sm text-gray-500">{item.weight}g — {item.grindType}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-1 hover:bg-brand-cream text-sm">-</button>
                    <span className="px-3 py-1 text-sm font-medium">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-1 hover:bg-brand-cream text-sm">+</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-brand-brown">
                      {(item.price * item.quantity).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL
                    </span>
                    <button onClick={() => removeItem(item.id)} className="text-red-400 hover:text-red-600 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="card p-6 sticky top-24">
            <h2 className="text-xl font-bold text-brand-brown mb-4">Sipariş Özeti</h2>

            <div className="space-y-3 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cart.subtotal')}</span>
                <span className="font-medium">{total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">{t('cart.shipping')}</span>
                <span className={shipping === 0 ? 'text-green-600 font-medium' : 'font-medium'}>
                  {shipping === 0 ? t('cart.free_shipping') : `${shipping.toFixed(2)} TL`}
                </span>
              </div>
            </div>

            {total < 500 && (
              <p className="text-xs text-brand-gold bg-brand-cream rounded-lg p-3 mb-4">
                {t('cart.free_shipping_info')}
              </p>
            )}

            <div className="border-t pt-3 mb-6">
              <div className="flex justify-between text-lg font-bold text-brand-brown">
                <span>{t('cart.total')}</span>
                <span>{grandTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL</span>
              </div>
            </div>

            <Link to="/checkout" className="btn-primary block text-center">
              {t('cart.checkout')}
            </Link>
            <Link to="/shop" className="block text-center mt-3 text-sm text-gray-500 hover:text-brand-brown transition-colors">
              {t('cart.continue_shopping')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
