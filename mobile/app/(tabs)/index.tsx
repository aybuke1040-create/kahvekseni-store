import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, Dimensions, FlatList,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../lib/api';

const { width } = Dimensions.get('window');

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  imageUrls: string[];
  origin: string;
}

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    api.get('/products?featured=true&limit=4')
      .then(r => setFeatured(r.data.data))
      .catch(() => {});
  }, []);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero */}
      <View style={styles.hero}>
        <Image
          source={{ uri: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800' }}
          style={StyleSheet.absoluteFillObject}
          resizeMode="cover"
        />
        <View style={styles.heroOverlay} />
        <View style={styles.heroContent}>
          <Text style={styles.heroLabel}>PREMIUM KAHVE</Text>
          <Text style={styles.heroTitle}>Gerçek Kahvenin{'\n'}Adresi</Text>
          <Text style={styles.heroSubtitle}>
            Dünyanın dört bir yanından özenle seçilmiş çekirdekler
          </Text>
          <Link href="/(tabs)/shop" asChild>
            <TouchableOpacity style={styles.heroCta}>
              <Text style={styles.heroCtaText}>Alışverişe Başla</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>

      {/* Why us */}
      <View style={styles.whySection}>
        {[
          { icon: '☕', title: 'Taze Kavurma', desc: 'Siparişten sonra kavrulur' },
          { icon: '⭐', title: 'Kalite Garantisi', desc: 'Özenle seçilmiş' },
          { icon: '🚀', title: 'Hızlı Teslimat', desc: '2-3 iş günü' },
        ].map((item) => (
          <View key={item.title} style={styles.whyItem}>
            <Text style={styles.whyIcon}>{item.icon}</Text>
            <Text style={styles.whyTitle}>{item.title}</Text>
            <Text style={styles.whyDesc}>{item.desc}</Text>
          </View>
        ))}
      </View>

      {/* Featured products */}
      {featured.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Öne Çıkan Ürünler</Text>
          <FlatList
            data={featured}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 16, gap: 12 }}
            renderItem={({ item }) => (
              <Link href={`/product/${item.slug}`} asChild>
                <TouchableOpacity style={styles.productCard}>
                  <Image
                    source={{ uri: item.imageUrls[0] || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300' }}
                    style={styles.productImage}
                    resizeMode="cover"
                  />
                  <View style={styles.productInfo}>
                    {item.origin && <Text style={styles.productOrigin}>{item.origin}</Text>}
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>{Number(item.price).toFixed(2)} TL</Text>
                  </View>
                </TouchableOpacity>
              </Link>
            )}
          />
        </View>
      )}

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  hero: { height: 400, justifyContent: 'flex-end' },
  heroOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(59,31,10,0.65)' },
  heroContent: { padding: 24 },
  heroLabel: { color: Colors.gold, fontSize: 11, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: Colors.cream, fontSize: 36, fontWeight: 'bold', lineHeight: 44, marginBottom: 8 },
  heroSubtitle: { color: Colors.creamDark, fontSize: 14, opacity: 0.9, marginBottom: 20 },
  heroCta: { backgroundColor: Colors.gold, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, alignSelf: 'flex-start' },
  heroCtaText: { color: 'white', fontWeight: '700', fontSize: 15 },
  whySection: { flexDirection: 'row', backgroundColor: 'white', paddingVertical: 16 },
  whyItem: { flex: 1, alignItems: 'center', padding: 8 },
  whyIcon: { fontSize: 24, marginBottom: 4 },
  whyTitle: { color: Colors.brown, fontWeight: '600', fontSize: 11, textAlign: 'center' },
  whyDesc: { color: Colors.gray, fontSize: 10, textAlign: 'center', marginTop: 2 },
  section: { paddingTop: 24 },
  sectionTitle: { color: Colors.brown, fontSize: 20, fontWeight: 'bold', paddingHorizontal: 16, marginBottom: 16 },
  productCard: { width: (width - 60) / 2, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  productImage: { width: '100%', height: 140 },
  productInfo: { padding: 12 },
  productOrigin: { color: Colors.gold, fontSize: 10, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  productName: { color: Colors.brown, fontWeight: '600', fontSize: 13, marginBottom: 6 },
  productPrice: { color: Colors.brown, fontWeight: 'bold', fontSize: 15 },
});
