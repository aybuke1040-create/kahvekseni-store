import { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  Image, StyleSheet, ActivityIndicator, Dimensions,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../lib/api';

const { width } = Dimensions.get('window');
const COLS = 2;
const CARD_WIDTH = (width - 48) / COLS;

interface Product {
  id: string;
  slug: string;
  name: string;
  shortDesc: string;
  price: number;
  imageUrls: string[];
  stock: number;
  origin: string;
}

export default function ShopScreen() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProducts = async (q?: string) => {
    setLoading(true);
    try {
      const params = q ? `?search=${q}` : '';
      const r = await api.get(`/products${params}`);
      setProducts(r.data.data);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleSearch = () => fetchProducts(search);

  return (
    <View style={styles.container}>
      {/* Search */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Kahve ara..."
          placeholderTextColor={Colors.gray}
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchBtn} onPress={handleSearch}>
          <Text style={styles.searchBtnText}>Ara</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={products}
          numColumns={COLS}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={{ gap: 12 }}
          ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
          renderItem={({ item }) => (
            <Link href={`/product/${item.slug}`} asChild>
              <TouchableOpacity style={styles.card}>
                <Image
                  source={{ uri: item.imageUrls[0] || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=300' }}
                  style={styles.cardImage}
                  resizeMode="cover"
                />
                <View style={styles.cardBody}>
                  {item.origin && <Text style={styles.origin}>{item.origin}</Text>}
                  <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
                  {item.shortDesc && <Text style={styles.desc} numberOfLines={1}>{item.shortDesc}</Text>}
                  <Text style={styles.price}>{Number(item.price).toFixed(2)} TL</Text>
                  {item.stock === 0 && <Text style={styles.outOfStock}>Stok Yok</Text>}
                </View>
              </TouchableOpacity>
            </Link>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Ürün bulunamadı</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  searchRow: { flexDirection: 'row', padding: 16, gap: 8, backgroundColor: 'white' },
  searchInput: { flex: 1, backgroundColor: Colors.grayLight, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10, color: Colors.brown, fontSize: 14 },
  searchBtn: { backgroundColor: Colors.brown, paddingHorizontal: 16, borderRadius: 10, justifyContent: 'center' },
  searchBtnText: { color: Colors.cream, fontWeight: '600', fontSize: 13 },
  grid: { padding: 16 },
  card: { width: CARD_WIDTH, backgroundColor: 'white', borderRadius: 16, overflow: 'hidden' },
  cardImage: { width: '100%', height: 130 },
  cardBody: { padding: 10 },
  origin: { color: Colors.gold, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 2 },
  name: { color: Colors.brown, fontWeight: '600', fontSize: 12, marginBottom: 2 },
  desc: { color: Colors.gray, fontSize: 10, marginBottom: 4 },
  price: { color: Colors.brown, fontWeight: 'bold', fontSize: 14 },
  outOfStock: { color: Colors.error, fontSize: 10, marginTop: 2, fontWeight: '600' },
  empty: { color: Colors.gray, textAlign: 'center', marginTop: 40, fontSize: 15 },
});
