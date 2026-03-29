import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function B2B() {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    companyName: '', contactName: '', email: '',
    phone: '', taxNumber: '', city: '', message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/b2b/request', form);
      setSubmitted(true);
      toast.success(t('b2b.success'));
    } catch {
      toast.error(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const benefits = [
    t('b2b.benefit_1'),
    t('b2b.benefit_2'),
    t('b2b.benefit_3'),
    t('b2b.benefit_4'),
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-brand-brown text-brand-cream py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-gold uppercase tracking-widest text-sm font-semibold mb-4">B2B</p>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t('b2b.title')}</h1>
          <p className="text-brand-cream-dark opacity-80 text-lg max-w-xl mx-auto">{t('b2b.subtitle')}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Benefits */}
          <div>
            <h2 className="text-2xl font-bold text-brand-brown mb-6">{t('b2b.benefits_title')}</h2>
            <div className="space-y-4">
              {benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-brand-gold rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-brand-brown leading-relaxed">{benefit}</p>
                </div>
              ))}
            </div>

            {/* Wholesale price table */}
            <div className="mt-8 card overflow-hidden">
              <div className="bg-brand-brown text-brand-cream p-4">
                <h3 className="font-semibold">Toptan Sipariş Miktarları</h3>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-brand-cream">
                  <tr>
                    <th className="text-left px-4 py-2 text-brand-brown">Miktar</th>
                    <th className="text-left px-4 py-2 text-brand-brown">İndirim</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t"><td className="px-4 py-3">10-49 kg</td><td className="px-4 py-3 text-green-600 font-medium">%20 İndirim</td></tr>
                  <tr className="border-t bg-brand-cream/30"><td className="px-4 py-3">50-99 kg</td><td className="px-4 py-3 text-green-600 font-medium">%30 İndirim</td></tr>
                  <tr className="border-t"><td className="px-4 py-3">100+ kg</td><td className="px-4 py-3 text-green-600 font-medium">%40 İndirim</td></tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Form */}
          <div>
            {submitted ? (
              <div className="card p-8 text-center">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-brand-brown mb-2">Talebiniz Alındı!</h3>
                <p className="text-gray-500">{t('b2b.success')}</p>
              </div>
            ) : (
              <div className="card p-6">
                <h2 className="text-2xl font-bold text-brand-brown mb-6">{t('b2b.form_title')}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('b2b.company_name')} *</label>
                      <input name="companyName" value={form.companyName} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('b2b.contact_name')} *</label>
                      <input name="contactName" value={form.contactName} onChange={handleChange} required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('b2b.email')} *</label>
                    <input type="email" name="email" value={form.email} onChange={handleChange} required className="input-field" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('b2b.phone')} *</label>
                      <input name="phone" value={form.phone} onChange={handleChange} required className="input-field" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">{t('b2b.city')} *</label>
                      <input name="city" value={form.city} onChange={handleChange} required className="input-field" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('b2b.tax_number')}</label>
                    <input name="taxNumber" value={form.taxNumber} onChange={handleChange} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">{t('b2b.message')}</label>
                    <textarea name="message" value={form.message} onChange={handleChange} rows={4} className="input-field resize-none" />
                  </div>
                  <button type="submit" disabled={loading} className="btn-primary w-full">
                    {loading ? t('common.loading') : t('b2b.submit')}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
