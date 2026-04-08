import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import api from '../lib/api';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('orderId');
  const [verifying, setVerifying] = useState(true);
  const [isValidSuccess, setIsValidSuccess] = useState(false);

  useEffect(() => {
    const verify = async () => {
      if (!orderId) {
        navigate('/payment/failed', { replace: true });
        return;
      }

      try {
        const res = await api.get(`/orders/${orderId}`);
        const status = res.data?.data?.status;
        const allowed = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];
        if (allowed.includes(status)) {
          setIsValidSuccess(true);
        } else {
          navigate(`/payment/failed?orderId=${orderId}`, { replace: true });
          return;
        }
      } catch {
        navigate(`/payment/failed?orderId=${orderId}`, { replace: true });
        return;
      } finally {
        setVerifying(false);
      }
    };

    verify();
  }, [orderId, navigate]);

  if (verifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center text-gray-500">Odeme durumu dogrulaniyor...</div>
      </div>
    );
  }

  if (!isValidSuccess) return null;

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Ödeme Başarılı!</h1>
        <p className="text-gray-500 mb-6">Siparişiniz alındı. En kısa sürede hazırlanacak.</p>
        {orderId && <p className="text-sm text-gray-400 mb-6">Sipariş ID: {orderId}</p>}
        <div className="flex gap-3 justify-center">
          <Link to="/account" className="btn-primary">Siparişlerimi Gör</Link>
          <Link to="/shop" className="btn-secondary">Alışverişe Devam</Link>
        </div>
      </div>
    </div>
  );
}
