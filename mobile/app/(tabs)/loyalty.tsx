import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../lib/api';

interface Loyalty {
  points: number;
  tier: string;
  totalEarned: number;
  totalSpent: number;
  transactions: Array<{
    id: string; type: string; points: number; description: string; createdAt: string;
  }>;
}

const TIER_COLORS: Record<string, string> = {
  BRONZE: '#CD7F32', SILVER: '#A8A8A8', GOLD: '#C8963E',
};

const TIER_LABELS: Record<string, string> = {
  BRONZE: 'Bronz', SILVER: 'Gümüş', GOLD: 'Altın',
};

export default function LoyaltyScreen() {
  const [loyalty, setLoyalty] = useState<Loyalty | null>(null);
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('accessToken').then(token => {
      if (!token) { setLoading(false); return; }
      setAuthed(true);
      api.get('/loyalty')
        .then(r => setLoyalty(r.data.data))
        .finally(() => setLoading(false));
    });
  }, []);

  if (loading) return <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 60 }} />;

  if (!authed) return (
    <View style={styles.center}>
      <Text style={styles.loginMsg}>Puanlarınızı görmek için giriş yapın</Text>
      <TouchableOpacity style={styles.loginBtn} onPress={() => router.push('/account')}>
        <Text style={styles.loginBtnText}>Giriş Yap</Text>
      </TouchableOpacity>
    </View>
  );

  const tiers = [
    { name: 'BRONZE', label: 'Bronz', min: 0, benefits: ['Her TL = 1 puan'] },
    { name: 'SILVER', label: 'Gümüş', min: 500, benefits: ['Her TL = 1.5 puan', 'Özel indirimler'] },
    { name: 'GOLD', label: 'Altın', min: 2000, benefits: ['Her TL = 2 puan', 'Ücretsiz kargo'] },
  ];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Points card */}
      <View style={styles.pointsCard}>
        <Text style={styles.pointsLabel}>Puanlarınız</Text>
        <Text style={styles.pointsValue}>{loyalty?.points?.toLocaleString()}</Text>
        <Text style={styles.pointsSubtext}>≈ {((loyalty?.points || 0) * 0.01).toFixed(2)} TL değerinde</Text>
        <View style={[styles.tierBadge, { backgroundColor: TIER_COLORS[loyalty?.tier || 'BRONZE'] }]}>
          <Text style={styles.tierBadgeText}>{TIER_LABELS[loyalty?.tier || 'BRONZE']}</Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{loyalty?.totalEarned?.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Toplam Kazanılan</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{loyalty?.totalSpent?.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Harcanan</Text>
        </View>
      </View>

      {/* Tiers */}
      <Text style={styles.sectionTitle}>Seviyeler</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ padding: 16, gap: 12 }}>
        {tiers.map(tier => (
          <View key={tier.name} style={[styles.tierCard, tier.name === loyalty?.tier && styles.activeTier]}>
            <View style={[styles.tierIcon, { backgroundColor: TIER_COLORS[tier.name] }]}>
              <Text style={styles.tierIconText}>{tier.label[0]}</Text>
            </View>
            <Text style={styles.tierName}>{tier.label}</Text>
            <Text style={styles.tierMin}>{tier.min.toLocaleString()}+ puan</Text>
            {tier.benefits.map(b => (
              <Text key={b} style={styles.tierBenefit}>✓ {b}</Text>
            ))}
          </View>
        ))}
      </ScrollView>

      {/* History */}
      {loyalty?.transactions && loyalty.transactions.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Son İşlemler</Text>
          <View style={styles.historyCard}>
            {loyalty.transactions.slice(0, 10).map(tx => (
              <View key={tx.id} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyDesc}>{tx.description}</Text>
                  <Text style={styles.historyDate}>{new Date(tx.createdAt).toLocaleDateString('tr-TR')}</Text>
                </View>
                <Text style={[styles.historyPoints, (tx.type === 'EARN' || tx.type === 'BONUS') ? { color: Colors.success } : { color: Colors.error }]}>
                  {(tx.type === 'EARN' || tx.type === 'BONUS') ? '+' : '-'}{tx.points}
                </Text>
              </View>
            ))}
          </View>
        </>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loginMsg: { color: Colors.brown, fontSize: 16, textAlign: 'center' },
  loginBtn: { backgroundColor: Colors.brown, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  loginBtnText: { color: Colors.cream, fontWeight: '700' },
  pointsCard: { backgroundColor: Colors.brown, margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  pointsLabel: { color: Colors.gold, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  pointsValue: { color: Colors.cream, fontSize: 52, fontWeight: 'bold', marginVertical: 4 },
  pointsSubtext: { color: Colors.creamDark, opacity: 0.7, fontSize: 13 },
  tierBadge: { marginTop: 12, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  tierBadgeText: { color: 'white', fontWeight: '700', fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 12, paddingHorizontal: 16, marginBottom: 8 },
  statCard: { flex: 1, backgroundColor: 'white', borderRadius: 14, padding: 16, alignItems: 'center' },
  statValue: { color: Colors.brown, fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: Colors.gray, fontSize: 11, marginTop: 2 },
  sectionTitle: { color: Colors.brown, fontSize: 17, fontWeight: 'bold', paddingHorizontal: 16, marginTop: 16, marginBottom: 4 },
  tierCard: { width: 160, backgroundColor: 'white', borderRadius: 16, padding: 14, borderWidth: 2, borderColor: 'transparent' },
  activeTier: { borderColor: Colors.gold },
  tierIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  tierIconText: { color: 'white', fontWeight: 'bold', fontSize: 14 },
  tierName: { color: Colors.brown, fontWeight: '700', fontSize: 14 },
  tierMin: { color: Colors.gray, fontSize: 11, marginBottom: 6 },
  tierBenefit: { color: Colors.brown, fontSize: 11, marginTop: 3 },
  historyCard: { marginHorizontal: 16, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  historyRow: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  historyDesc: { color: Colors.brown, fontSize: 13, fontWeight: '500' },
  historyDate: { color: Colors.gray, fontSize: 10, marginTop: 2 },
  historyPoints: { fontSize: 16, fontWeight: 'bold' },
});
