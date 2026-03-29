import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';
import { useAuthStore } from '../store/authStore';

interface Loyalty {
  points: number;
  tier: string;
  totalEarned: number;
  totalSpent: number;
  transactions: Array<{
    id: string;
    type: string;
    points: number;
    description: string;
    createdAt: string;
  }>;
}

const tierColors: Record<string, string> = {
  BRONZE: 'bg-amber-700',
  SILVER: 'bg-gray-400',
  GOLD: 'bg-brand-gold',
};

const tierLabels: Record<string, string> = {
  BRONZE: 'Bronz',
  SILVER: 'Gümüş',
  GOLD: 'Altın',
};

export default function Loyalty() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login'); return; }
    api.get('/loyalty')
      .then(r => setLoyalty(r.data.data))
      .finally(() => setLoading(false));
  }, [isAuthenticated, navigate]);

  if (loading) return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><div className="inline-block w-8 h-8 border-4 border-brand-gold border-t-transparent rounded-full animate-spin" /></div>;

  const tiers = [
    { name: 'BRONZE', label: 'Bronz', min: 0, max: 499, color: '#CD7F32', benefits: ['Her TL = 1 puan', 'Ücretsiz kargo (500 TL üzeri)'] },
    { name: 'SILVER', label: 'Gümüş', min: 500, max: 1999, color: '#C0C0C0', benefits: ['Her TL = 1.5 puan', 'Ücretsiz kargo (300 TL üzeri)', 'Özel indirimler'] },
    { name: 'GOLD', label: 'Altın', min: 2000, max: null, color: '#C8963E', benefits: ['Her TL = 2 puan', 'Her zaman ücretsiz kargo', 'Öncelikli destek'] },
  ];

  const currentTierData = tiers.find(t => t.name === loyalty?.tier);
  const nextTier = tiers[tiers.findIndex(t => t.name === loyalty?.tier) + 1];
  const progress = nextTier && loyalty
    ? Math.min(100, ((loyalty.totalEarned - (currentTierData?.min || 0)) / ((nextTier.min) - (currentTierData?.min || 0))) * 100)
    : 100;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold text-brand-brown mb-8">{t('loyalty.title')}</h1>

      {/* Points card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card p-6 bg-brand-brown text-brand-cream md:col-span-1">
          <p className="text-brand-gold text-sm uppercase tracking-wide mb-2">{t('loyalty.your_points')}</p>
          <p className="text-5xl font-bold mb-1">{loyalty?.points?.toLocaleString()}</p>
          <p className="text-brand-cream-dark opacity-70 text-sm">≈ {((loyalty?.points || 0) * 0.01).toFixed(2)} TL değerinde</p>

          <div className="mt-4 flex items-center gap-2">
            <span className={`${tierColors[loyalty?.tier || 'BRONZE']} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
              {tierLabels[loyalty?.tier || 'BRONZE']}
            </span>
          </div>
        </div>

        <div className="card p-6 md:col-span-2">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="text-center p-4 bg-brand-cream rounded-xl">
              <p className="text-2xl font-bold text-brand-brown">{loyalty?.totalEarned?.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">{t('loyalty.total_earned')}</p>
            </div>
            <div className="text-center p-4 bg-brand-cream rounded-xl">
              <p className="text-2xl font-bold text-brand-brown">{loyalty?.totalSpent?.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Harcanan Puan</p>
            </div>
          </div>

          {nextTier && (
            <div>
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>{tierLabels[loyalty?.tier || 'BRONZE']}</span>
                <span>{nextTier.label} için {(nextTier.min - (loyalty?.totalEarned || 0))} puan kaldı</span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tier Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`card p-6 ${tier.name === loyalty?.tier ? 'ring-2 ring-brand-gold' : ''}`}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: tier.color }}>
                {tier.label[0]}
              </div>
              <div>
                <h3 className="font-bold text-brand-brown">{tier.label}</h3>
                <p className="text-xs text-gray-500">{tier.min.toLocaleString()}+ puan</p>
              </div>
              {tier.name === loyalty?.tier && (
                <span className="ml-auto text-xs bg-brand-gold text-white px-2 py-0.5 rounded-full">Seviyeniz</span>
              )}
            </div>
            <ul className="space-y-2">
              {tier.benefits.map((b) => (
                <li key={b} className="flex items-center gap-2 text-sm text-gray-600">
                  <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {b}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Transaction history */}
      {loyalty?.transactions && loyalty.transactions.length > 0 && (
        <div className="card overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-brand-brown">{t('loyalty.history')}</h2>
          </div>
          <div className="divide-y">
            {loyalty.transactions.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-4">
                <div>
                  <p className="font-medium text-brand-brown">{tx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</p>
                </div>
                <span className={`font-bold text-lg ${tx.type === 'EARN' || tx.type === 'BONUS' ? 'text-green-600' : 'text-red-500'}`}>
                  {tx.type === 'EARN' || tx.type === 'BONUS' ? '+' : '-'}{tx.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
