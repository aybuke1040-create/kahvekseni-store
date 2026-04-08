import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useCartStore } from '../../store/cartStore';
import { useAuthStore } from '../../store/authStore';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { itemCount } = useCartStore();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleLang = () => {
    i18n.changeLanguage(i18n.language === 'tr' ? 'en' : 'tr');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="bg-brand-brown text-brand-cream sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <span className="text-brand-gold text-2xl">&#9749;</span>
            <span className="text-xl font-bold tracking-wide">KAHVEKSENİ</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link to="/" className="hover:text-brand-gold transition-colors">{t('nav.home')}</Link>
            <Link to="/shop" className="hover:text-brand-gold transition-colors">{t('nav.shop')}</Link>
            <Link to="/b2b" className="hover:text-brand-gold transition-colors">{t('nav.b2b')}</Link>
            {isAuthenticated && (
              <Link to="/loyalty" className="hover:text-brand-gold transition-colors">{t('nav.loyalty')}</Link>
            )}
          </nav>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLang}
              className="text-xs border border-brand-gold text-brand-gold px-2 py-1 rounded hover:bg-brand-gold hover:text-brand-brown transition-colors"
            >
              {i18n.language === 'tr' ? 'EN' : 'TR'}
            </button>

            {/* Cart */}
            <Link to="/cart" className="relative hover:text-brand-gold transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-brand-gold text-brand-brown text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="relative group">
                <button className="flex items-center gap-1 hover:text-brand-gold transition-colors text-sm">
                  <span>{user?.firstName}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div className="absolute right-0 top-full mt-1 bg-white text-brand-brown rounded-lg shadow-lg py-2 min-w-40 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                  <Link to="/account" className="block px-4 py-2 hover:bg-brand-cream text-sm">{t('nav.account')}</Link>
                  <Link to="/loyalty" className="block px-4 py-2 hover:bg-brand-cream text-sm">{t('nav.loyalty')}</Link>
                  {user?.role === 'ADMIN' && (
                    <Link to="/admin" className="block px-4 py-2 hover:bg-brand-cream text-sm">Admin Panel</Link>
                  )}
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 hover:bg-brand-cream text-sm text-red-600">
                    {t('nav.logout')}
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="text-sm hover:text-brand-gold transition-colors">
                {t('nav.login')}
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d={menuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="md:hidden py-4 border-t border-brand-brown-light flex flex-col gap-3 text-sm">
            <Link to="/" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">{t('nav.home')}</Link>
            <Link to="/shop" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">{t('nav.shop')}</Link>
            <Link to="/b2b" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">{t('nav.b2b')}</Link>
            <Link to="/loyalty" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">{t('nav.loyalty')}</Link>
            {user?.role === 'ADMIN' && (
              <Link to="/admin" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">Admin Panel</Link>
            )}
            {!isAuthenticated && (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="hover:text-brand-gold">{t('nav.login')}</Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
