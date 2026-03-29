import { Link } from 'react-router-dom';

export default function PaymentFailed() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-brand-brown mb-2">Ödeme Başarısız</h1>
        <p className="text-gray-500 mb-6">İşlem gerçekleştirilemedi. Lütfen tekrar deneyin.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/cart" className="btn-primary">Sepete Dön</Link>
          <Link to="/shop" className="btn-secondary">Alışverişe Devam</Link>
        </div>
      </div>
    </div>
  );
}
