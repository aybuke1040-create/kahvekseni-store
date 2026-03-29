import { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Colors } from '../../constants';
import api from '../../lib/api';
import { useCartStore } from '../../store/cartStore';

interface Variant {
  id: string; grindType: string; weight: number; price: number; stock: number;
}

interface Product {
  id: string; slug: string; name: string; description: string;
  price: number; imageUrls: string[]; origin: string; roastLevel: string;
  flavorNotes: string[]; stock: number; variants: Variant[];
  category: { name: string };
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);

  useEffect(() => {
    if (!id) return;
    api.get(`/products/${id}`)
      .then(r => {
        setProduct(r.data.data);
        if (r.data.data.variants?.length) setSelectedVariant(r.data.data.variants[0]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <ActivityIndicator color={Colors.gold} size="large" style={{ marginTop: 60 }} />;
  if (!product) return <View style={styles.container}><Text>Ürün bulunamadı</Text></View>;

  const price = selectedVariant?.price || product.price;
  const weights = [...new Set(product.variants.map(v => v.weight))].sort((a, b) => a - b);
  const grindTypes = [...new Set(product.variants.map(v => v.grindType))];

  const handleAddToCart = () => {
    addItem({
      id: `${product.id}-${selectedVariant?.id || 'default'}-${Date.now()}`,
      productId: product.id,
      variantId: selectedVariant?.id,
      name: product.name,
      price,
      imageUrl: product.imageUrls[0] || '',
      quantity,
      grindType: selectedVariant?.grindType,
      weight: selectedVariant?.weight,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.imageUrls[0] || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=600' }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.content}>
        <Text style={styles.category}>{product.category?.name}</Text>
        <Text style={styles.name}>{product.name}</Text>

        <View style={styles.metaRow}>
          {product.origin && <Text style={styles.meta}>📍 {product.origin}</Text>}
          {product.roastLevel && <Text style={styles.meta}>🔥 {product.roastLevel}</Text>}
        </View>

        {product.flavorNotes?.length > 0 && (
          <View style={styles.notesRow}>
            {product.flavorNotes.map(note => (
              <View key={note} style={styles.noteBadge}>
                <Text style={styles.noteText}>{note}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.desc}>{product.description}</Text>

        {weights.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={styles.variantLabel}>Gramaj</Text>
            <View style={styles.variantRow}>
              {weights.map(w => {
                const v = product.variants.find(vv => vv.weight === w && (!selectedVariant || vv.grindType === selectedVariant.grindType));
                return (
                  <TouchableOpacity
                    key={w}
                    style={[styles.variantBtn, selectedVariant?.weight === w && styles.variantBtnActive]}
                    onPress={() => v && setSelectedVariant(v)}
                  >
                    <Text style={[styles.variantBtnText, selectedVariant?.weight === w && styles.variantBtnTextActive]}>{w}g</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        {grindTypes.length > 0 && (
          <View style={styles.variantSection}>
            <Text style={styles.variantLabel}>Öğütme</Text>
            <View style={styles.variantRow}>
              {grindTypes.map(g => {
                const v = product.variants.find(vv => vv.grindType === g && (!selectedVariant || vv.weight === selectedVariant.weight));
                return (
                  <TouchableOpacity
                    key={g}
                    style={[styles.variantBtn, selectedVariant?.grindType === g && styles.variantBtnActive]}
                    onPress={() => v && setSelectedVariant(v)}
                  >
                    <Text style={[styles.variantBtnText, selectedVariant?.grindType === g && styles.variantBtnTextActive]}>{g}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={styles.bottomRow}>
          <Text style={styles.price}>{Number(price).toFixed(2)} TL</Text>
          <View style={styles.qtyRow}>
            <TouchableOpacity onPress={() => setQuantity(Math.max(1, quantity - 1))} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>-</Text>
            </TouchableOpacity>
            <Text style={styles.qty}>{quantity}</Text>
            <TouchableOpacity onPress={() => setQuantity(quantity + 1)} style={styles.qtyBtn}>
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={[styles.addBtn, added && styles.addBtnSuccess]} onPress={handleAddToCart}>
          <Text style={styles.addBtnText}>{added ? '✓ Sepete Eklendi' : 'Sepete Ekle'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  image: { width: '100%', height: 300 },
  content: { padding: 20 },
  category: { color: Colors.gold, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 },
  name: { color: Colors.brown, fontSize: 26, fontWeight: 'bold', marginBottom: 10 },
  metaRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  meta: { color: Colors.gray, fontSize: 13 },
  notesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  noteBadge: { backgroundColor: Colors.creamDark, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  noteText: { color: Colors.brown, fontSize: 12 },
  desc: { color: '#4B5563', lineHeight: 22, fontSize: 14, marginBottom: 16 },
  variantSection: { marginBottom: 12 },
  variantLabel: { color: Colors.brown, fontWeight: '600', fontSize: 14, marginBottom: 8 },
  variantRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  variantBtn: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1.5, borderColor: '#D1D5DB' },
  variantBtnActive: { backgroundColor: Colors.brown, borderColor: Colors.brown },
  variantBtnText: { color: Colors.brown, fontSize: 13, fontWeight: '500' },
  variantBtnTextActive: { color: Colors.cream },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 12 },
  price: { color: Colors.brown, fontSize: 28, fontWeight: 'bold' },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 10 },
  qtyBtn: { paddingHorizontal: 14, paddingVertical: 8 },
  qtyBtnText: { color: Colors.brown, fontSize: 20, fontWeight: '600' },
  qty: { paddingHorizontal: 14, color: Colors.brown, fontWeight: '600', fontSize: 16 },
  addBtn: { backgroundColor: Colors.brown, padding: 16, borderRadius: 14, alignItems: 'center' },
  addBtnSuccess: { backgroundColor: Colors.success },
  addBtnText: { color: Colors.cream, fontWeight: '700', fontSize: 16 },
});
