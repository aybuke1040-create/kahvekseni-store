import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, Alert,
} from 'react-native';
import { Link } from 'expo-router';
import { Colors } from '../../constants';
import { useCartStore } from '../../store/cartStore';

export default function CartScreen() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const shipping = total() >= 500 ? 0 : 29.99;
  const grandTotal = total() + shipping;

  if (items.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Sepetiniz Boş</Text>
        <Text style={styles.emptyDesc}>Alışverişe başlamak için ürün ekleyin</Text>
        <Link href="/(tabs)/shop" asChild>
          <TouchableOpacity style={styles.shopBtn}>
            <Text style={styles.shopBtnText}>Mağazaya Git</Text>
          </TouchableOpacity>
        </Link>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <View style={styles.item}>
            <Image
              source={{ uri: item.imageUrl || 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=100' }}
              style={styles.itemImage}
              resizeMode="cover"
            />
            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
              {item.weight && <Text style={styles.itemVariant}>{item.weight}g — {item.grindType}</Text>}
              <View style={styles.itemBottom}>
                <View style={styles.qtyRow}>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity - 1)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>-</Text>
                  </TouchableOpacity>
                  <Text style={styles.qty}>{item.quantity}</Text>
                  <TouchableOpacity onPress={() => updateQuantity(item.id, item.quantity + 1)} style={styles.qtyBtn}>
                    <Text style={styles.qtyBtnText}>+</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.itemPrice}>{(item.price * item.quantity).toFixed(2)} TL</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => Alert.alert('Kaldır', 'Bu ürünü sepetten kaldırmak istiyor musunuz?', [
                { text: 'İptal', style: 'cancel' },
                { text: 'Kaldır', style: 'destructive', onPress: () => removeItem(item.id) },
              ])}
              style={styles.removeBtn}
            >
              <Text style={styles.removeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.summary}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Ara Toplam</Text>
              <Text style={styles.summaryValue}>{total().toFixed(2)} TL</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Kargo</Text>
              <Text style={[styles.summaryValue, shipping === 0 && { color: Colors.success }]}>
                {shipping === 0 ? 'Ücretsiz' : `${shipping.toFixed(2)} TL`}
              </Text>
            </View>
            {total() < 500 && (
              <Text style={styles.shippingInfo}>500 TL ve üzeri alışverişlerde ücretsiz kargo</Text>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>{grandTotal.toFixed(2)} TL</Text>
            </View>
            <Link href="/checkout" asChild>
              <TouchableOpacity style={styles.checkoutBtn}>
                <Text style={styles.checkoutBtnText}>Ödemeye Geç</Text>
              </TouchableOpacity>
            </Link>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.cream },
  emptyContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: Colors.cream },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { color: Colors.brown, fontSize: 20, fontWeight: 'bold', marginBottom: 6 },
  emptyDesc: { color: Colors.gray, fontSize: 14, marginBottom: 20, textAlign: 'center' },
  shopBtn: { backgroundColor: Colors.brown, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  shopBtnText: { color: Colors.cream, fontWeight: '700' },
  list: { padding: 16 },
  item: { backgroundColor: 'white', borderRadius: 14, padding: 12, flexDirection: 'row', gap: 10 },
  itemImage: { width: 70, height: 70, borderRadius: 10 },
  itemInfo: { flex: 1 },
  itemName: { color: Colors.brown, fontWeight: '600', fontSize: 13 },
  itemVariant: { color: Colors.gray, fontSize: 11, marginTop: 2 },
  itemBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8 },
  qtyBtn: { paddingHorizontal: 10, paddingVertical: 4 },
  qtyBtnText: { color: Colors.brown, fontSize: 16, fontWeight: '600' },
  qty: { paddingHorizontal: 10, color: Colors.brown, fontWeight: '600' },
  itemPrice: { color: Colors.brown, fontWeight: 'bold', fontSize: 14 },
  removeBtn: { padding: 4 },
  removeBtnText: { color: Colors.error, fontSize: 14 },
  summary: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginTop: 12 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  summaryLabel: { color: Colors.gray, fontSize: 14 },
  summaryValue: { color: Colors.brown, fontWeight: '600', fontSize: 14 },
  shippingInfo: { color: Colors.gold, fontSize: 11, backgroundColor: '#FEF3C7', padding: 8, borderRadius: 8, marginBottom: 8 },
  totalRow: { borderTopWidth: 1, borderTopColor: '#E5E7EB', paddingTop: 10, marginTop: 4 },
  totalLabel: { color: Colors.brown, fontSize: 17, fontWeight: 'bold' },
  totalValue: { color: Colors.brown, fontSize: 17, fontWeight: 'bold' },
  checkoutBtn: { backgroundColor: Colors.brown, padding: 15, borderRadius: 12, alignItems: 'center', marginTop: 12 },
  checkoutBtnText: { color: Colors.cream, fontWeight: '700', fontSize: 16 },
});
