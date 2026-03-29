import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="bg-brand-brown text-brand-cream mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-brand-gold text-2xl">&#9749;</span>
              <span className="text-xl font-bold">KAHVEKSENİ</span>
            </div>
            <p className="text-sm text-brand-cream-dark opacity-80 max-w-xs">
              Dünyanın dört bir yanından özenle seçilmiş çekirdekler, sizin için kavruluyor.
            </p>
            <div className="flex gap-3 mt-4">
              <a href="#" className="w-9 h-9 bg-brand-brown-light rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors">
                <span className="text-xs font-bold">IG</span>
              </a>
              <a href="#" className="w-9 h-9 bg-brand-brown-light rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors">
                <span className="text-xs font-bold">FB</span>
              </a>
              <a href="#" className="w-9 h-9 bg-brand-brown-light rounded-full flex items-center justify-center hover:bg-brand-gold transition-colors">
                <span className="text-xs font-bold">TW</span>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-brand-gold mb-4">Mağaza</h4>
            <ul className="space-y-2 text-sm text-brand-cream-dark opacity-80">
              <li><Link to="/shop" className="hover:text-brand-cream transition-colors">{t('nav.shop')}</Link></li>
              <li><Link to="/b2b" className="hover:text-brand-cream transition-colors">{t('nav.b2b')}</Link></li>
              <li><Link to="/loyalty" className="hover:text-brand-cream transition-colors">{t('nav.loyalty')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-brand-gold mb-4">İletişim</h4>
            <ul className="space-y-2 text-sm text-brand-cream-dark opacity-80">
              <li>info@kahvekseni.com</li>
              <li>+90 (212) 000 00 00</li>
              <li>Pazartesi - Cuma: 09:00 - 18:00</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-brand-brown-light mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-brand-cream-dark opacity-60">
          <p>&copy; 2024 KAHVEKSENİ. Tüm hakları saklıdır.</p>
          <div className="flex gap-4 mt-2 sm:mt-0">
            <a href="#" className="hover:opacity-100">Gizlilik Politikası</a>
            <a href="#" className="hover:opacity-100">Kullanım Koşulları</a>
            <a href="#" className="hover:opacity-100">İade Politikası</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
