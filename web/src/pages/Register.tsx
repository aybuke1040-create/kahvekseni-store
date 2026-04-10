import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import toast from 'react-hot-toast';
import api from '../lib/api';
import { apiData } from '../lib/api-helpers';
import { useAuthStore } from '../store/authStore';

export default function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', phone: '', role: 'RETAIL',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/auth/register', form);
      const auth = apiData<{ user?: Parameters<typeof setAuth>[0]; accessToken?: string; refreshToken?: string }>(response);
      if (!auth?.user || !auth.accessToken || !auth.refreshToken) throw new Error('Invalid auth response');
      setAuth(auth.user, auth.accessToken, auth.refreshToken);
      toast.success('Hoş geldiniz!');
      navigate('/');
    } catch {
      toast.error('Kayıt sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-brand-gold text-4xl">&#9749;</span>
          <h1 className="text-2xl font-bold text-brand-brown mt-2">{t('auth.register_title')}</h1>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.first_name')}</label>
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required className="input-field" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">{t('auth.last_name')}</label>
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required className="input-field" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.email')}</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.phone')}</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">{t('auth.password')}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Hesap Türü</label>
              <div className="flex gap-4">
                {['RETAIL', 'WHOLESALE'].map((r) => (
                  <label key={r} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="role" value={r} checked={form.role === r} onChange={(e) => setForm({ ...form, role: e.target.value })} />
                    <span className="text-sm">{r === 'RETAIL' ? 'Bireysel' : 'Kurumsal / Toptan'}</span>
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? t('common.loading') : t('auth.register_btn')}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-gray-500">{t('auth.has_account')} </span>
            <Link to="/login" className="text-brand-gold font-semibold hover:underline">{t('nav.login')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
