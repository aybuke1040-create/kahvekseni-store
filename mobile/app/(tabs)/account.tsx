import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as LocalAuthentication from 'expo-local-authentication';
import { Colors } from '../../constants';
import api from '../../lib/api';

interface User {
  id: string; email: string; firstName: string; lastName: string; role: string;
}

export default function AccountScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [tab, setTab] = useState<'login' | 'orders'>('login');
  const [orders, setOrders] = useState<unknown[]>([]);

  useEffect(() => {
    AsyncStorage.getItem('user').then(stored => {
      if (stored) setUser(JSON.parse(stored));
    });
  }, []);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      await AsyncStorage.setItem('accessToken', data.data.accessToken);
      await AsyncStorage.setItem('refreshToken', data.data.refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(data.data.user));
      setUser(data.data.user);
    } catch {
      Alert.alert('Hata', 'E-posta veya şifre hatalı');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = async () => {
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'KAHVEKSENİ\'ye giriş yapın',
      fallbackLabel: 'Şifre kullan',
    });
    if (result.success) {
      Alert.alert('Başarılı', 'Biyometrik doğrulama başarılı');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.multiRemove(['accessToken', 'refreshToken', 'user']);
    setUser(null);
    setOrders([]);
  };

  const loadOrders = async () => {
    try {
      const r = await api.get('/orders');
      setOrders(r.data.data);
      setTab('orders');
    } catch {}
  };

  if (!user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.loginContainer}>
        <Text style={styles.brandIcon}>☕</Text>
        <Text style={styles.title}>Giriş Yap</Text>

        <TextInput
          style={styles.input}
          placeholder="E-posta"
          placeholderTextColor={Colors.gray}
          value={form.email}
          onChangeText={(v) => setForm({ ...form, email: v })}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <TextInput
          style={styles.input}
          placeholder="Şifre"
          placeholderTextColor={Colors.gray}
          value={form.password}
          onChangeText={(v) => setForm({ ...form, password: v })}
          secureTextEntry
        />
        <TouchableOpacity style={styles.loginBtn} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color="white" /> : <Text style={styles.loginBtnText}>Giriş Yap</Text>}
        </TouchableOpacity>

        <TouchableOpacity style={styles.biometricBtn} onPress={handleBiometric}>
          <Text style={styles.biometricText}>🔐 Biyometrik Giriş</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Profile */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.firstName.charAt(0)}</Text>
        </View>
        <Text style={styles.userName}>{user.firstName} {user.lastName}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role === 'WHOLESALE' ? 'Toptan Müşteri' : user.role === 'ADMIN' ? 'Admin' : 'Bireysel Müşteri'}</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={loadOrders}>
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>Siparişlerim</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Profil', 'Profil düzenleme yakında')}>
          <Text style={styles.actionIcon}>✏️</Text>
          <Text style={styles.actionText}>Profili Düzenle</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.logoutBtn]} onPress={handleLogout}>
          <Text style={styles.actionIcon}>🚪</Text>
          <Text style={[styles.actionText, { color: Colors.error }]}>Çıkış Yap</Text>
        </TouchableOpacity>
      </View>

      {/* Orders */}
      {tab === 'orders' && (
        <View style={styles.ordersSection}>
          <Text style={styles.sectionTitle}>Siparişlerim</Text>
          {orders.length === 0 ? (
            <Text style={styles.noOrders}>Henüz sipariş yok</Text>
          ) : (
            (orders as Array<Record<string, unknown>>).map((order) => (
              <View key={order.id as string} style={styles.orderCard}>
                <Text style={styles.orderNumber}>{order.orderNumber as string}</Text>
                <Text style={styles.orderTotal}>{Number(order.total).toFixed(2)} TL</Text>
              </View>
            ))
          )}
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  loginContainer: { padding: 24, alignItems: 'center', justifyContent: 'center', minHeight: 600 },
  brandIcon: { fontSize: 48, marginBottom: 8 },
  title: { color: Colors.brown, fontSize: 24, fontWeight: 'bold', marginBottom: 24 },
  input: { width: '100%', backgroundColor: 'white', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14, color: Colors.brown, fontSize: 15, marginBottom: 12, borderWidth: 1, borderColor: Colors.creamDark },
  loginBtn: { backgroundColor: Colors.brown, width: '100%', paddingVertical: 14, borderRadius: 12, alignItems: 'center', marginTop: 4 },
  loginBtnText: { color: Colors.cream, fontWeight: '700', fontSize: 16 },
  biometricBtn: { marginTop: 16, paddingVertical: 12 },
  biometricText: { color: Colors.brown, fontWeight: '500' },
  profileCard: { backgroundColor: Colors.brown, margin: 16, borderRadius: 20, padding: 24, alignItems: 'center' },
  avatar: { width: 64, height: 64, backgroundColor: Colors.gold, borderRadius: 32, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  avatarText: { color: 'white', fontSize: 28, fontWeight: 'bold' },
  userName: { color: Colors.cream, fontSize: 20, fontWeight: 'bold' },
  userEmail: { color: Colors.creamDark, opacity: 0.7, fontSize: 13, marginTop: 2 },
  roleBadge: { marginTop: 10, backgroundColor: Colors.brownLight, paddingHorizontal: 14, paddingVertical: 4, borderRadius: 12 },
  roleText: { color: Colors.cream, fontSize: 11, fontWeight: '600' },
  actions: { marginHorizontal: 16, marginTop: 8, gap: 8 },
  actionBtn: { backgroundColor: 'white', padding: 16, borderRadius: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  logoutBtn: { borderWidth: 1, borderColor: '#FEE2E2' },
  actionIcon: { fontSize: 20 },
  actionText: { color: Colors.brown, fontWeight: '600', fontSize: 15 },
  ordersSection: { marginHorizontal: 16, marginTop: 16 },
  sectionTitle: { color: Colors.brown, fontSize: 17, fontWeight: 'bold', marginBottom: 10 },
  noOrders: { color: Colors.gray, textAlign: 'center', padding: 20 },
  orderCard: { backgroundColor: 'white', borderRadius: 12, padding: 14, marginBottom: 8, flexDirection: 'row', justifyContent: 'space-between' },
  orderNumber: { color: Colors.brown, fontWeight: '600' },
  orderTotal: { color: Colors.brown, fontWeight: 'bold' },
});
